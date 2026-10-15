# Red-Team Data Isolation & Privacy Boundary Assessment

**Objective:** Verify that users cannot access, modify, delete, or inspect private resources belonging to other users or organizations.  
**Methodology:** Cross-Account Synthetic Role Probing  

---

## 1. Cross-User Resource Boundary Test Matrix

| Resource Type | Owner Model | Cross-User Attack Attempted | Enforcement Mechanism | Test Observation | Result |
|---|---|---|---|---|---|
| **User Profile** | Self (`userId`) | User A passes User B's ID to `PUT /api/v1/auth/profile` | Server ignores body ID; uses `x-user-id` from verified JWT | User A can only update their own profile | **SECURE (PASS)** |
| **Candidate Resume** | Self / Linked Employer | Employer A attempts to view Candidate B's private resume via `GET /api/v1/auth/resume?userId=B` | Enforced check: candidate must have applied to Employer A or set resume to public | Blocked with `HTTP 403 Forbidden` | **SECURE (PASS)** |
| **Job Postings** | Employer (`employerId`) | Employer A attempts to update or delete Employer B's job (`DELETE /api/v1/jobs/:id`) | `JobRepository.ts`: `if (existingJob.employerId !== employerId) return 403` | Blocked with `HTTP 403 Access denied: You do not own this job` | **SECURE (PASS)** |
| **Job Applicants** | Job Owner | Employer A requests applicants for Employer B's job (`GET /api/v1/jobs/:id/applicants`) | `getApplicantsForJob`: Verifies job employer ID against request `x-user-id` | Blocked with `HTTP 403 / Error: Unauthorized or job not found` | **SECURE (PASS)** |
| **Interview Records** | Candidate / Employer | Candidate A attempts to update interview rating/feedback | `updateEmployerInterviewStatus`: Verifies caller has role `employer` & owns job | Blocked with `HTTP 401 / 403` | **SECURE (PASS)** |
| **Support Tickets** | Ticket Creator | User A attempts to view User B's ticket (`GET /api/support/tickets/:id`) | `SupportService.ts`: `if (role !== 'admin' && ticket.user_id !== userId) return 403` | Blocked with `HTTP 403 Forbidden: You do not have access to view this ticket` | **SECURE (PASS)** |
| **Notifications** | Target User | User A attempts to mark User B's notification read (`PATCH /api/v1/notifications/:id/read`) | `NotificationRepository`: `WHERE id = $1 AND user_id = $2` | Zero rows updated; returns 404/no-op | **SECURE (PASS)** |
| **Public Profiles** | Public / Candidate | Unauthenticated bot scrapes `/api/v1/auth/public-profile/:id` | `UserController.ts`: Sanitized public DTO strips direct phone & email | Professional profile visible; direct contact info masked | **SECURE (PASS)** |

---

## 2. Multi-Tenant & Employer Isolation Analysis

1. **Job Ownership Scoping:**
   - Every mutating job operation (`updateJob`, `deleteJob`, `updateApplicantStatus`, `scheduleInterview`) explicitly checks `employer_id = $2` in the database query.
   - Attackers cannot hijack another company's job postings simply by guessing UUIDs.
2. **Applicant Privacy Scoping:**
   - When candidates apply to a job, their application record links to `job_id` and `user_id`.
   - Competitor employers cannot view applicants for another company's job postings.
3. **Cache Key Isolation:**
   - Redis keys are strictly scoped by user ID (e.g. `user:profile:${id}`).
   - An authenticated session cannot trigger cross-user cache collisions.
