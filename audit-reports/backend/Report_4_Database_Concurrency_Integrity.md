# Report 4: Database Integrity, Concurrency Control & Race Conditions Audit

**Evaluator:** Senior Database Engineer & Concurrency Specialist  
**Database Engine:** PostgreSQL (Neon Serverless PostgreSQL with SSL `verify-full`)  
**Driver / Client:** `pg` (v8.22.0) Connection Pool  
**Audit Objective:** Concurrency Safety, Atomicity, Idempotency, Transaction Boundaries, and Connection Pool Capacity  

---

## 1. Concurrency Control & Race Condition Findings

### 1.1 Confirmed Race Condition: Duplicate Job Reports (TOCTOU)
During Phase 8 controlled concurrency testing, 5 simultaneous HTTP requests were dispatched to report the same job by the same user:
- **Test Endpoint:** `POST /api/v1/jobs/9b8253f9-909d-4576-967b-6a16fb05897e/report`
- **Result:** **All 5 concurrent requests succeeded with HTTP 200**.
- **Database Verification:**
  ```sql
  SELECT id, reason, created_at FROM reports 
  WHERE reporter_id = '579940b5-d72e-419b-9c4d-7fe8ff1c4406' 
    AND reported_content_id = '9b8253f9-909d-4576-967b-6a16fb05897e';
  ```
  **Output: 5 duplicate rows were inserted into the `reports` table simultaneously.**

#### Root Cause Analysis
In `backend/src/modules/jobs/repositories/JobRepository.ts`:
```typescript
// Step 1: Check if already reported
if (safeReporterId) {
  const existing = await pool.query(
    "SELECT id FROM reports WHERE reporter_id = $1 AND reported_content_id = $2 AND status = 'PENDING' LIMIT 1",
    [safeReporterId, targetJobId]
  );
  if (existing.rows.length > 0) {
    return { alreadyReported: true, message: 'You have already reported this job listing.' };
  }
}

// Step 2: Insert report record
const insertQuery = `INSERT INTO reports (...) VALUES (...) RETURNING *;`;
await pool.query(insertQuery, [...]);
```
This is a textbook **Time-of-Check to Time-of-Use (TOCTOU)** race condition. Between the `SELECT` query and the `INSERT` query, concurrent worker threads execute the `SELECT`, find zero existing rows, and all proceed to execute the `INSERT`.

#### Recommended Database Fix
Add a partial unique index in PostgreSQL:
```sql
CREATE UNIQUE INDEX IF NOT EXISTS uq_reports_pending_duplicate 
ON reports (reporter_id, reported_content_id) 
WHERE status = 'PENDING';
```
And update the insert query with `ON CONFLICT DO NOTHING`:
```sql
INSERT INTO reports (id, reporter_id, reported_user_id, reported_content_id, reported_content_type, reason, status, created_at)
VALUES (gen_random_uuid(), $1, $2, $3, 'JOB', $4, 'PENDING', CURRENT_TIMESTAMP)
ON CONFLICT (reporter_id, reported_content_id) WHERE status = 'PENDING'
DO NOTHING
RETURNING *;
```

---

### 1.2 Bookmark Toggle (`saved_jobs`) Race Condition
In `backend/src/modules/auth/repositories/UserRepository.ts`:
```typescript
const checkQuery = 'SELECT id FROM saved_jobs WHERE user_id = $1 AND job_id = $2;';
const checkResult = await pool.query(checkQuery, [userId, jobId]);

if (checkResult.rows.length > 0) {
  await pool.query('DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2;', [userId, jobId]);
  res = { isSaved: false };
} else {
  await pool.query('INSERT INTO saved_jobs (user_id, job_id) VALUES ($1, $2);', [userId, jobId]);
  res = { isSaved: true };
}
```
Because `saved_jobs` has `CONSTRAINT unique_user_saved_job UNIQUE(user_id, job_id)`, rapid double-clicks on the save button cause concurrent requests to execute `INSERT`, resulting in an unhandled PostgreSQL error `23505 (unique_violation)` that bubbles up to the user as a 409 or 500 server error.

#### Recommended Fix
Handle conflict gracefully:
```typescript
await pool.query(
  'INSERT INTO saved_jobs (user_id, job_id) VALUES ($1, $2) ON CONFLICT (user_id, job_id) DO NOTHING;',
  [userId, jobId]
);
```

---

### 1.3 Verified Idempotent Operations: Job Applications
In `backend/src/modules/jobs/repositories/JobRepository.ts`:
```sql
INSERT INTO job_applications (job_id, user_id, status)
VALUES ($1, $2, 'applied')
ON CONFLICT (job_id, user_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
RETURNING *;
```
- **Evaluation:** **EXCELLENT (Idempotent by Design)**.
- Repeated rapid submissions by a candidate do not create duplicate application records or corrupt applicant state.

---

## 2. Database Connection Pooling & Sizing Architecture

### 2.1 Pool Configuration Across Services
In `backend/shared/database/pool.ts`:
```typescript
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});
```

### 2.2 Microservices Connection Multiplication Risk
- **Total Services:** 9 microservices running concurrently.
- **Connections per Service:** `max: 10`
- **Total Potential Pool Size:** `9 × 10 = 90 simultaneous connections`.
- **Neon Database Free / Pro Tier Limits:**
  - Standard Neon direct endpoint (`ep-...-pooler` vs direct `ep-...`): Direct PostgreSQL connections typically cap between 100–128 connections.
  - If the deployment scales horizontally (e.g. 2 instances of API Gateway and 2 instances of worker services on Render), active connection requests will exceed 180, causing `Connection terminated unexpectedly` or `FATAL: remaining connection slots are reserved for non-replication superuser connections`.

### 2.3 SRE Recommendation
1. Configure Neon **Pooled Connection String** (`-pooler` endpoint using PgBouncer in transaction mode) in production `DATABASE_URL`.
2. Tune `max` connections per service based on workload profile:
   - `auth-service`, `job-service`, `application-service`: `max: 5`
   - `support-service`, `ad-service`, `admin-service`: `max: 2`
   - Total idle footprint reduced from 90 to 20 connections per cluster node.

---

## 3. Query Efficiency & Index Coverage

### 3.1 Indexes Verified Present
- `idx_jobs_employer_id` on `jobs(employer_id)`
- `idx_jobs_status` on `jobs(status)`
- `idx_jobs_posted_at` on `jobs(posted_at)`
- `idx_job_applications_job_id` on `job_applications(job_id)`
- `idx_job_applications_user_id` on `job_applications(user_id)`
- `idx_saved_jobs_user_id` on `saved_jobs(user_id)`
- Trigram / GIN indexes on `jobs(title, company, description)` for full-text search fallback.

### 3.2 Missing Indexes
1. `reports (reporter_id, reported_content_id) WHERE status = 'PENDING'` (Enforces concurrency uniqueness).
2. `support_tickets (user_id)` (Accelerates `/api/support/tickets` lookups for logged-in users).
