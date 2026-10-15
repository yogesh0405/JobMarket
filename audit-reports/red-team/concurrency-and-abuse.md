# Red-Team Concurrency, Race Condition & Abuse Assessment

**Scope:** Parallel Request Fuzzing, Race Conditions, Double-Action Abuse & Resource Exhaustion  
**Testing Harness:** Custom Multi-Threaded Node.js Concurrent HTTP Dispatcher  

---

## 1. Concurrency Attack Simulations

### 1.1 Parallel Job Reporting Race Condition (TOCTOU)
- **Target Endpoint:** `POST /api/v1/jobs/:id/report`
- **Attack Scenario:** An attacker sends 5 simultaneous POST requests to report a job, attempting to bypass single-report rate limiting and spam the database.
- **Baseline Behavior (Pre-Remediation):**
  - All 5 concurrent threads passed the un-locked `SELECT id FROM reports` check simultaneously.
  - **Result: 5 duplicate rows were inserted into the `reports` table.**
- **Post-Remediation Verification:**
  - Implemented `SELECT pg_advisory_xact_lock(hashtext('report_' || $1 || '_' || $2))` within the transaction.
  - Test rerun with 5 simultaneous requests:
    ```text
    Req #2 -> Status: 200 | {"success":true,"message":"Report submitted successfully..."}
    Req #1 -> Status: 200 | {"success":true,"message":"You have already reported this job listing..."}
    Req #3 -> Status: 200 | {"success":true,"message":"You have already reported this job listing..."}
    Req #4 -> Status: 200 | {"success":true,"message":"You have already reported this job listing..."}
    Req #5 -> Status: 200 | {"success":true,"message":"You have already reported this job listing..."}
    ```
  - **Database Verification:** Exactly **1 row** inserted. The remaining 4 requests cleanly acquired the lock, detected the pending report, and returned a duplicate notice without database duplication.
- **Verdict:** **CONFIRMED VULNERABILITY -> FULLY REMEDIATED (PASS)**.

---

### 1.2 Parallel Job Application Submission
- **Target Endpoint:** `POST /api/v1/jobs/:id/apply`
- **Attack Scenario:** Rapid double-clicking or scripted automated submissions sending 10 identical application payloads simultaneously.
- **Enforcement:**
  - Handled via `ON CONFLICT (job_id, user_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP`.
- **Observed Behavior:**
  - Exactly 1 application record maintained in `job_applications`.
  - Zero duplicate rows created.
- **Verdict:** **NOT VULNERABLE IN TEST (Atomic Database Upsert)**.

---

### 1.3 OTP Replay & Parallel Verification
- **Target Endpoint:** `POST /api/v1/auth/verify-otp`
- **Attack Scenario:** Attacker captures a valid OTP and sends 5 parallel verification requests to create multiple sessions or duplicate accounts.
- **Enforcement:**
  - `users` table enforces `UNIQUE(email)`.
  - Registration verification is wrapped in `BEGIN ... COMMIT` transaction.
  - When the first transaction commits, subsequent parallel transactions encounter `23505 (unique_violation)` and execute `ROLLBACK`.
- **Observed Behavior:** Only 1 user account created.
- **Verdict:** **NOT VULNERABLE IN TEST**.

---

## 2. Resource Exhaustion & Denial-of-Service Abuse

### 2.1 ReDoS (Regular Expression Denial of Service)
- **Vectors Checked:** Coordinate extractor regex, email validation regex, phone sanitization regex.
- **Test:** Fuzzed with 10,000-character repetitive strings (e.g. `aaaaaaaa@aaaaaaaa...`).
- **Result:** Linear evaluation time (<2ms); zero catastrophic backtracking observed.

### 2.2 Unbounded Search Query Abuse
- **Target Endpoint:** `GET /api/v1/jobs/search?limit=1000000`
- **Enforcement:**
  - In `SearchService.ts`:
    ```typescript
    const limit = Math.min(50, Math.max(1, Number(params.limit) || 20));
    ```
  - The server clamps the maximum allowable limit to 50 results per query, preventing memory exhaustion.
- **Verdict:** **NOT VULNERABLE IN TEST**.
