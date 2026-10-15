# Report 5: Secrets, SSRF, Scalability & SRE Production Readiness Audit

**Evaluator:** Senior Application Security Engineer & Site Reliability Engineer (SRE)  
**Infrastructure Target:** Containerized Node.js Environment (Render / AWS ECS)  
**Components:** Secrets Hygiene, Network Boundary (SSRF), Redis Caching, Kafka Queues, and Logging  

---

## 1. Secrets Leakage & Credential Security Audit

### 1.1 Critical Finding: Service Account Key Committed in Git
- **Vulnerability Category:** Hardcoded Cloud Provider / Firebase Credentials in Git Repository.
- **Affected File:** `backend/serviceAccountKey.json`
- **Current Git Tracking Status:**
  ```bash
  git ls-files --stage serviceAccountKey.json
  # Output: 100644 ad6cd455e453290018962f60d6a9fc164bbacea1 0 serviceAccountKey.json
  ```
  **`serviceAccountKey.json` is actively tracked in git despite being present in `.gitignore`.**
- **Git Commit History:**
  Committed in commit `5d3d2c819471d0eb287859a9951a502c1bfba4c3` ("Backend code").
- **Impact:** Anyone with clone access to the git repository has access to private Google Cloud / Firebase service account credentials.
- **Remediation Plan:**
  1. Untrack the file immediately from git cache: `git rm --cached backend/serviceAccountKey.json`.
  2. Rotate the Firebase Admin Service Account Private Key in Google Cloud Console.
  3. Load the service account credentials exclusively via `FIREBASE_SERVICE_ACCOUNT` environment variable (JSON string or Base64) in production hosting environments (e.g. Render/AWS Secret Manager).

### 1.2 Environment Variables & Config Validation
- **Shared Kernel (`backend/shared/config/env.ts`):** Validates all environment variables using Zod schemas (`envSchema`).
- **Production Secrets Separation:** `.env` is omitted from git tracking. Only `.env.example` with non-sensitive placeholder variables is tracked.

---

## 2. Server-Side Request Forgery (SSRF) Audit

### Critical Finding: Blind SSRF in Google Maps URL Resolver
- **Affected Route:** `POST /api/v1/jobs/resolve-map-url`
- **CWE:** CWE-918 (Server-Side Request Forgery / SSRF)
- **Vulnerability Evidence:**
  In `backend/services/job-service/src/controllers/JobController.ts`:
  ```typescript
  // LINE 293:
  if (inputUrl.includes('goo.gl') || inputUrl.includes('maps.app') || inputUrl.includes('google.com/maps') || inputUrl.includes('http')) {
    const response = await fetch(inputUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: { ... }
    });
  }
  ```
- **Flaw:**
  Notice `|| inputUrl.includes('http')` without host allowlisting!
  Any string containing `http` (such as `http://127.0.0.1:5001/health` or `http://169.254.169.254/latest/meta-data/`) triggers the backend Node process to make an outbound HTTP GET request to internal network interfaces, loopback microservices, or cloud instance metadata services.
- **Remediation Required:**
  Enforce strict hostname allowlisting for Google Maps domains:
  ```typescript
  const allowedHosts = ['maps.google.com', 'goo.gl', 'maps.app.goo.gl', 'www.google.com'];
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(inputUrl);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const isGoogleMaps = allowedHosts.some(allowed => hostname === allowed || hostname.endsWith('.' + allowed));
  if (!isGoogleMaps || parsedUrl.protocol !== 'https:') {
    return res.status(400).json({ error: 'URL must be a valid HTTPS Google Maps link' });
  }
  ```

---

## 3. High-Load Scalability & Resilience Audit

### 3.1 Distributed Caching (Redis)
- **Engine:** `redisClient` with automated offline fallback.
- **Cache TTLs:**
  - Candidate Profile: `900s` (15 minutes) with on-demand cache invalidation on profile updates.
  - Full-Text Search Queries: `180s` (3 minutes) caching normalized filter query hashes.
- **Resilience:** If Redis crashes or undergoes maintenance, cache calls seamlessly bypass cache and query PostgreSQL directly without throwing 500 errors to end users.

### 3.2 Rate Limiting
- **Implementation:** Redis atomic transaction (`MULTI -> INCR -> TTL -> EXEC`).
- **Resilient Fallback:** Automatically switches to an in-memory sliding window `Map` with periodic garbage collection if Redis is disconnected.
- **Status:** **PASS (Production Ready)**.

### 3.3 Event-Driven Architecture (Apache Kafka)
- **Client:** `kafkajs` (v2.2.4)
- **Graceful Initialization:** Configured with non-blocking promises in `start_microservices.ts`. If Kafka broker is unreachable, services continue operating via direct transactional logging.

### 3.4 Request Body Limits & DoS Prevention
- **Observation:** `api-gateway/src/app.ts` configures `express.json({ limit: '50mb' })` globally.
- **Risk:** High-concurrency unauthenticated requests sending 50MB payloads can cause Node process memory exhaustion (OOM).
- **Recommendation:** Restrict global body parser to `100kb` for standard JSON endpoints, and configure `50mb` limit only on authenticated media upload routes (`/profile/picture`, `/resume`, `/advertisements`).
