# Report F: Functional & Regression Test Report

**Application**: JobMarket Mobile Application  
**Test Suite Focus**: Core Candidate & Employer User Journeys  
**Date**: October 14, 2026  

---

## 1. Test Execution Inventory

| Test ID | User Journey / Workflow | Target Screen / Module | Expected Behavior | Actual Behavior | Result |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | App Bootstrap & Session Restore | `AuthContext` / `AppNavigator` | Reads token from SecureStore; boots directly to Candidate/Employer tab if valid | Fast in-memory token lookup with zero UI flicker | **PASS** |
| **TC-02** | Role-Based Navigation Routing | `AppNavigator.tsx` | Routes employer to `EmployerTabNavigator` and candidate to `CandidateTabNavigator` | Clean separation between candidate and employer views | **PASS** |
| **TC-03** | Public Job Search & List Display | `CandidateJobSearchScreen` | Fetches active jobs from `/api/v1/jobs`; renders title, salary, tags | Renders list with FlashList recycling | **PASS** |
| **TC-04** | Job Detail Navigation & Expansion | `CandidateJobDetailScreen` | Clicking job card opens full job info, requirements, and apply CTA | Clean navigation with proper header safe area | **PASS** |
| **TC-05** | Job Report Submission Flow | `ReportJobScreen` | Submits scam/fraud report with category and description; prevents duplicate | Validates input; calls `/jobs/:id/report` with fallback | **PASS** |
| **TC-06** | Job Bookmark / Save Toggle | `candidateApi.toggleSaveJob` | Toggles bookmark state; updates `savedJobsStore` locally | Persistent across app restarts via SecureStore | **PASS** |
| **TC-07** | Account Suspension Interception | `AccountSuspendedScreen` | Server 403 `ACCOUNT_BLOCKED` forces immediate logout and displays suspension screen | Immediate override of all navigation stacks | **PASS** |
| **TC-08** | Offline Detection & Banner Display | `NetworkContext` | Disconnection triggers global offline notification; reconnect dismisses it | Clean listener response without layout jumps | **PASS** |
| **TC-09** | Token Refresh on 401 Expiry | `client.ts` (`fetchWithTimeout`)| Intercepts 401; calls `/auth/refresh`; retries original failed request seamlessly | Promise queue resolves all concurrent callers | **PASS** |
| **TC-10** | TypeScript Type Stability | `MobileApp/` | Zero compilation errors or missing property definitions across all 60+ components | Verified via `npx tsc --noEmit` (0 errors) | **PASS** |

---

## 2. Regression Defect Log

- **DEF-01 (Play Store Format)**: `eas.json` specifies `"buildType": "apk"` in production. This breaks Google Play automated ingestion.
- **DEF-02 (Dangerous Permission)**: `SYSTEM_ALERT_WINDOW` in `AndroidManifest.xml` triggers Play Store compliance review failure.
- **DEF-03 (Cleartext Traffic)**: `app.json` has `"usesCleartextTraffic": true`, violating OWASP transport rules.
- **DEF-04 (Intent Filter Desynchronization)**: Deep links configured in `app.json` for `job-market-wine.vercel.app` are not present in `AndroidManifest.xml`.
