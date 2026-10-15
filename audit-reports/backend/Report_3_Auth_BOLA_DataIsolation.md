# Report 3: Authentication, Authorization (BOLA/IDOR) & Data Privacy Audit

**Evaluator:** Senior Application Security Engineer & Penetration Tester  
**Scope:** Identity Lifecycle, Token Security, Privilege Escalation, BOLA/IDOR, and Privacy Isolation  

---

## 1. Authentication Engine & Token Security

### 1.1 Password Hashing & Key Parameters
- **Algorithm:** `bcrypt`
- **Salt Rounds:** 12 rounds in `VerifyOTPService.ts` and `changePassword`, 10 rounds in legacy helper methods.
- **Verification:** Securely verified via `bcrypt.compare(passwordPlain, user.password_hash)`.
- **Verdict:** **COMPLIANT (Industry Standard)**. Meets OWASP password storage recommendations.

### 1.2 Access & Refresh Token Architecture
- **Algorithm:** HMAC SHA-256 (`HS256`) via `jsonwebtoken`.
- **Token Lifetimes:**
  - Access Token: `1d` (24 hours).
  - Refresh Token: `7d` (7 days).
- **Embedded Claims:** `{ userId, role, sessionId }`.
- **Real-Time Revocation:**
  - The API Gateway executes `SessionRepository.isSessionRevoked(decoded.sessionId)` for every incoming request bearing a valid JWT.
  - If a session is marked `revoked = TRUE` in the database, the Gateway immediately returns `HTTP 401 Unauthorized` (`SESSION_REVOKED`).
  - Single-session logout (`POST /api/v1/auth/logout`) and global device logout (`POST /api/v1/auth/logout-all`) properly update database status.

---

## 2. Confirmed Vulnerabilities & Exploitation Scenarios

### Finding 1: Critical Vertical Privilege Escalation & Unauthenticated PII Leakage in Support Service
- **Affected Route:** `GET /api/admin/support/`, `GET /api/admin/support/analytics`, `PATCH /api/admin/support/:id`, `DELETE /api/admin/support/:id`
- **CWE:** CWE-306 (Missing Authentication for Critical Function), CWE-862 (Missing Authorization)
- **Vulnerability Evidence (Active HTTP Verification):**
  ```bash
  curl -s http://localhost:5000/api/admin/support/analytics
  # Returned HTTP 200 with ticket statistics, resolution rates, and categories!
  
  curl -s http://localhost:5000/api/admin/support/
  # Returned HTTP 200 with 26 customer support tickets containing:
  # - Full customer names
  # - Personal email addresses
  # - Phone numbers
  # - Client IP addresses and mobile browser agents
  # - S3 attachment URLs
  ```
- **Root Cause:**
  In `backend/services/support-service/src/app.ts`:
  ```typescript
  // LINE 19:
  app.use('/api/admin/support', adminSupportRouter);
  ```
  Unlike `admin-service/src/app.ts`, which wraps all `/api/v1/admin` routes with an explicit RBAC role guard, `support-service` mounts `adminSupportRouter` with zero authentication or role checking.
- **Remediation Required:**
  Add strict admin RBAC middleware before mounting `adminSupportRouter`:
  ```typescript
  app.use('/api/admin/support', (req, res, next) => {
    const role = (req.headers['x-user-role'] as string || '').toLowerCase();
    const userId = req.headers['x-user-id'] as string;
    if (!userId || (role !== 'admin' && role !== 'superadmin')) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Access denied. Administrative credentials required.',
        errors: ['FORBIDDEN']
      });
    }
    next();
  }, adminSupportRouter);
  ```

---

### Finding 2: Critical Vertical Privilege Escalation on Admin Advertisements
- **Affected Route:** `GET /api/v1/admin/advertisements`, `PATCH /api/v1/admin/advertisements/:id/approve`, `DELETE /api/v1/admin/advertisements/:id`
- **CWE:** CWE-285 (Improper Authorization)
- **Vulnerability Evidence:**
  Calling `GET /api/v1/admin/advertisements` returned HTTP 200 with all pending, rejected, and active advertisement records along with internal employer contact details without requiring any JWT token or admin credentials.
- **Root Cause:**
  In `backend/services/ad-service/src/app.ts`:
  ```typescript
  // LINE 24:
  app.use('/api/v1/admin', adminAdvertisementRouter);
  ```
  Missing admin authentication middleware guard.
- **Remediation Required:**
  Enforce admin role verification before mounting `adminAdvertisementRouter` in `ad-service/src/app.ts`.

---

### Finding 3: High BOLA / IDOR on Candidate Resumes
- **Affected Route:** `GET /api/v1/auth/resume?userId=<targetUserId>`
- **CWE:** CWE-639 (Authorization Bypass Through User-Controlled Key / BOLA)
- **Vulnerability Evidence:**
  In `backend/services/user-service/src/controllers/UserController.ts`:
  ```typescript
  static async getResume(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const currentUserId = req.headers['x-user-id'] as string || req.user?.userId;
    const currentUserRole = req.headers['x-user-role'] as string || req.user?.role || 'candidate';

    let targetUserId = currentUserId;
    if ((currentUserRole === 'employer' || currentUserRole === 'admin') && req.query.userId) {
      targetUserId = req.query.userId as string;
    }

    const user = await UserRepository.findById(targetUserId);
    if (!user || !user.resume || !user.resume.url) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    res.status(200).json({ success: true, url: user.resume.url });
  }
  ```
- **Flaw:**
  Any user registered with role `employer` can supply `?userId=<any_candidate_id>` and immediately retrieve that candidate's private resume URL. The controller does NOT verify:
  1. Whether the candidate has actually applied to any job owned by that employer.
  2. Whether the candidate's `is_resume_public` setting is `true`.
- **Remediation Required:**
  Before returning the resume to an employer, verify application ownership or public resume permission:
  ```typescript
  if (currentUserRole === 'employer' && targetUserId !== currentUserId) {
    const hasAppliedOrPublic = await pool.query(
      `SELECT 1 FROM job_applications ja 
       JOIN jobs j ON ja.job_id = j.id 
       WHERE ja.user_id = $1 AND j.employer_id = $2
       UNION 
       SELECT 1 FROM users WHERE id = $1 AND is_resume_public = TRUE 
       LIMIT 1;`,
      [targetUserId, currentUserId]
    );
    if (hasAppliedOrPublic.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied: Candidate has not applied to your jobs and resume is private' });
    }
  }
  ```

---

### Finding 4: Medium Privacy Exposure — Unrestricted Candidate PII on Public Profile
- **Affected Route:** `GET /api/v1/auth/public-profile/:id`
- **CWE:** CWE-359 (Exposure of Private Personal Information)
- **Observed Behavior:**
  Unauthenticated callers fetching `/api/v1/auth/public-profile/:id` receive the full `user` object including:
  - Candidate personal email
  - Candidate direct phone number
  - Aadhaar verification status
  - Resume file details
- **Remediation Required:**
  Project explicit public fields only (e.g. name, headline, location, trade specialization, skills, bio, experience, education). Mask or exclude direct phone numbers and personal emails unless accessed by an employer with an active job application or interview.

---

## 3. Authentication & Privacy Audit Verdict

| Security Vector | Status | Risk Level |
|---|---|---|
| Password Storage & Salting | **PASS** | Low |
| Token Lifecycle & Session Revocation | **PASS** | Low |
| Admin Support Portal Authorization | **FAIL** | **CRITICAL** |
| Admin Advertisement Portal Authorization | **FAIL** | **CRITICAL** |
| Candidate Resume BOLA Access Control | **FAIL** | **HIGH** |
| Public Profile PII Projection | **PARTIAL** | **MEDIUM** |
