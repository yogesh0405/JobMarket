# Red-Team API Penetration Assessment: Endpoint Attack Log

**Testing Target:** API Gateway (`http://localhost:5000`)  
**Methodology:** Automated HTTP Fuzzing, Identity Manipulation, and Role Injection  

---

## 1. Authentication & Session Attacks

### 1.1 Rate-Limiting & Brute-Force Testing
- **Target Endpoint:** `POST /api/v1/auth/login`
- **Attack Scenario:** High-frequency dictionary attack sending 30 invalid login requests within 10 seconds.
- **Observed Behavior:**
  - Requests 1 to 20 returned `HTTP 401 Unauthorized`.
  - Request 21 and subsequent requests returned `HTTP 429 Too Many Requests`:
    ```json
    {
      "success": false,
      "message": "Too many requests, please try again later",
      "errors": ["RATE_LIMIT_EXCEEDED"]
    }
    ```
- **Verdict:** **NOT VULNERABLE IN TEST (Rate Limiter Functioning as Expected)**.

### 1.2 Session Revocation & Token Replay
- **Target Endpoint:** `GET /api/v1/auth/me` with a revoked JWT.
- **Attack Scenario:** User logs out via `POST /api/v1/auth/logout`. Attacker replays the previously captured Bearer token.
- **Observed Response:**
  ```json
  {
    "success": false,
    "error": "SESSION_REVOKED",
    "message": "Your session has been terminated. Please log in again."
  }
  ```
  Status: `HTTP 401 Unauthorized`.
- **Verdict:** **NOT VULNERABLE IN TEST (Real-Time Revocation Working)**.

---

## 2. Authorization & BOLA/IDOR Penetration

### 2.1 Candidate Private Resume Extraction (Pre vs Post Remediation)
- **Target Endpoint:** `GET /api/v1/auth/resume?userId=<candidateId>`
- **Attack Method:** Authenticated employer without an application relationship requests private candidate's resume.
- **Pre-Fix Test Result:**
  - Status: `HTTP 200 OK`. Attacker retrieved direct S3 resume URL.
- **Post-Fix Test Result (Verified Live):**
  ```bash
  Private Candidate Resume Probe -> Status: 403 | Body: {"error":"Access denied: Candidate has not applied to your jobs and resume is private"}
  ```
  Status: `HTTP 403 Forbidden`.
- **Verdict:** **REMEDIATED & VERIFIED (BOLA Blocked)**.

### 2.2 Unauthenticated Admin Support Exfiltration (Pre vs Post Remediation)
- **Target Endpoint:** `GET /api/admin/support/`
- **Attack Method:** Unauthenticated caller requests ticket list without `Authorization` header.
- **Pre-Fix Test Result:**
  - Status: `HTTP 200 OK`. Dumper retrieved 26 tickets with customer names, emails, phones, and IP addresses.
- **Post-Fix Test Result (Verified Live):**
  ```json
  {
    "success": false,
    "message": "Forbidden: Access denied. Administrative credentials required.",
    "errors": ["FORBIDDEN"]
  }
  ```
  Status: `HTTP 403 Forbidden`.
- **Verdict:** **REMEDIATED & VERIFIED (Auth Guard Enforced)**.

### 2.3 Unauthenticated Admin Advertisements Tampering (Pre vs Post Remediation)
- **Target Endpoint:** `GET /api/v1/admin/advertisements`
- **Attack Method:** Unauthenticated caller attempts to list and manipulate pending ads.
- **Pre-Fix Test Result:**
  - Status: `HTTP 200 OK`. Exposed full ad inventory and employer contact details.
- **Post-Fix Test Result (Verified Live):**
  - Status: `HTTP 403 Forbidden`.
- **Verdict:** **REMEDIATED & VERIFIED (Auth Guard Enforced)**.

---

## 3. Server-Side Request Forgery (SSRF) Penetration

### 3.1 Loopback & Internal Service Probing
- **Target Endpoint:** `POST /api/v1/jobs/resolve-map-url`
- **Attack Payload:**
  ```json
  { "url": "http://127.0.0.1:5001/health" }
  ```
- **Pre-Fix Test Result:**
  - Server made outbound HTTP request to port 5001 internally.
- **Post-Fix Test Result:**
  - Server validated protocol (`https:`) and domain against allowlist (`maps.google.com`, `maps.app.goo.gl`, `goo.gl`).
  - Internal IP request rejected immediately without network egress.
- **Verdict:** **REMEDIATED & VERIFIED (SSRF Blocked)**.

---

## 4. SQL Injection & Malformed Input Testing

### 4.1 Full-Text Search Fuzzing
- **Target Endpoint:** `GET /api/v1/jobs/search?q=' OR 1=1--`
- **Observed Behavior:**
  - The backend escaped the string into SQL parameter `$1`.
  - The query searched for jobs literally containing the string `' OR 1=1--`.
  - Returned `200 OK` with 0 matching jobs. Zero SQL syntax errors or database exceptions.
- **Verdict:** **NOT VULNERABLE IN TEST (Fully Parameterized Queries)**.
