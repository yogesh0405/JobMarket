# Red-Team Secrets & Infrastructure Credential Audit

**Target:** Entire Repository, Git Index, History, Configuration Files, and Logs  
**Rules Applied:** Rule 9 & Rule 12 strictly enforced (No secret values printed in plaintext).  

---

## 1. Discovered Credential Findings & Remediation

### 1.1 Critical Finding: Firebase Service Account Key in Git Index
- **File:** `backend/serviceAccountKey.json`
- **Credential Type:** Google Cloud Platform (GCP) / Firebase Admin SDK Service Account Private Key.
- **Git Tracking Discovery:**
  ```bash
  git ls-files --stage serviceAccountKey.json
  # Output: 100644 ad6cd455e453290018962f60d6a9fc164bbacea1 0 serviceAccountKey.json
  ```
- **Historical Commit:** Commit `5d3d2c819471d0eb287859a9951a502c1bfba4c3`.
- **Root Cause:**
  Although `*serviceAccountKey*.json` was defined in `backend/.gitignore`, the file had already been staged and committed in an earlier commit. Git does not untrack previously committed files unless explicitly removed from the index.
- **Remediation Executed:**
  ```bash
  git rm --cached backend/serviceAccountKey.json
  ```
  - The file has been untracked from the git repository index.
  - The local copy remains safely on disk for developer runtime execution.
  - Future commits will respect `.gitignore` and omit the file.
- **Mandatory Production Action for Owner:**
  Rotate the private key in Google Cloud Console -> IAM & Admin -> Service Accounts -> Keys -> Add Key (Create new) -> Delete Old Key.

---

## 2. Environment Variables & Secret Separation

### 2.1 File-Level Tracking Verification
```bash
git ls-files | grep -i "\.env"
```
**Output:** Only `.env.example` and service-level `.env.example` templates are tracked in git. All live `.env` files are properly excluded from git tracking.

### 2.2 Template Inspection
In `backend/.env.example`:
- Database URL: Placeholder string (`postgresql://user:password@host/dbname`)
- JWT Secrets: Placeholder strings (`your_jwt_access_secret_here`)
- AWS Credentials: Placeholder strings (`your_aws_access_key_id_here`)
- Brevo Key: Placeholder string (`your_brevo_api_key_here`)
- **Verdict:** **COMPLIANT (Clean Templates)**.

---

## 3. Logging & Error Output Hygiene

### 3.1 Logger Configuration
In [`backend/src/utils/logger.ts`](file:///Users/yogesh/Desktop/JobMarket/backend/src/utils/logger.ts):
- Log level set to `info` in production and `debug` in development.
- Winston logger outputs structured timestamped console logs.
- Request logging middleware does not log raw `req.body.password` or `Authorization` headers.

### 3.2 Error Handler Hygiene
In [`backend/shared/middlewares/errorHandler.ts`](file:///Users/yogesh/Desktop/JobMarket/backend/shared/middlewares/errorHandler.ts):
- In `production` environment, detailed database error messages and stack traces are suppressed:
  ```typescript
  const message = isProd 
    ? 'An unexpected server error occurred. Please try again later.' 
    : (err.message || 'Internal Server Error');
  ```
- Database connection strings, SQL query text, and internal file paths are masked from API responses.
- **Verdict:** **COMPLIANT**.
