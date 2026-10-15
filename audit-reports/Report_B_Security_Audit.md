# Report B: Defensive Security Audit (OWASP MASVS / MASTG)

**Application**: JobMarket Mobile Application (`com.jobmarket.mobileapp`)  
**Assessment Standard**: OWASP Mobile Application Security Verification Standard (MASVS v2.0)  
**Date**: October 14, 2026  

---

## 1. Authentication & Session Security (MASVS-AUTH)

### Verified Findings:
1. **Token Storage & Encryption (PASS)**:
   - Sensitive authentication tokens (`accessToken`, `refreshToken`, `sessionId`) are stored strictly using `expo-secure-store` ([secureStorage.ts](file:///Users/yogesh/Desktop/JobMarket/MobileApp/src/utils/secureStorage.ts)).
   - Native Android implementation leverages Android Keystore with AES-GCM encryption (`EncryptedSharedPreferences`).
   - Plaintext `AsyncStorage` is **NOT** used for access tokens or refresh tokens.
2. **Silent Refresh & Concurrency Queue (PASS)**:
   - [client.ts](file:///Users/yogesh/Desktop/JobMarket/MobileApp/src/api/client.ts) implements a concurrency queue (`failedQueue`) and atomic `isRefreshing` lock.
   - When multiple parallel requests encounter 401/418, only one refresh request is dispatched to `/api/v1/auth/refresh`. Queued callers await the new token without multiple session renewals.
3. **Session Invalidation & Suspension Handling (PASS)**:
   - Server response status 403 with `errorCode: 'ACCOUNT_BLOCKED'` or `'ACCOUNT_INACTIVE'` triggers immediate local session eviction via `clearAuthSession()`.
   - `clearAuthSession()` purges memory tokens, SecureStore items, applied jobs store, and saved jobs store, transitioning the user immediately to `AccountSuspendedScreen`.
4. **Server-Side Enforcement (PASS)**:
   - Role verification and permission authorization are strictly enforced by backend middleware (`authMiddleware.ts`, `roleMiddleware.ts`). Client-side checks are strictly UI route guards and are never trusted as authorization controls.

---

## 2. Secrets & Sensitive Data Exposure (MASVS-STORAGE)

### Verified Findings:
1. **Codebase Hardcoded Secret Scan (PASS)**:
   - Scanned all TypeScript and JavaScript files in `MobileApp/src/` for patterns including API keys, database URLs, and AWS access keys.
   - Zero hardcoded credentials or database passwords exist in the mobile application code.
2. **Environment Variable Redaction (PASS)**:
   - Only public client keys are exposed (`EXPO_PUBLIC_CARTO_API_KEY` for map basemaps, `EXPO_PUBLIC_API_URL` for backend endpoint).
   - Sensitive backend database URLs and private signing keys are completely absent from MobileApp files.
3. **Android Backup Configuration (DEFECT - MEDIUM)**:
   - **Finding**: [AndroidManifest.xml](file:///Users/yogesh/Desktop/JobMarket/MobileApp/android/app/src/main/AndroidManifest.xml#L15) specifies `android:allowBackup="true"`.
   - **Risk**: Allows physical adb extraction (`adb backup`) of non-keystore shared preferences.
   - **Remediation**: Set `android:allowBackup="false"` in `AndroidManifest.xml` or define a selective `res/xml/backup_rules.xml` schema.

---

## 3. Network & Transport Security (MASVS-NETWORK)

### Verified Findings:
1. **Cleartext HTTP Permitted in Release (DEFECT - HIGH)**:
   - **Finding**: [app.json](file:///Users/yogesh/Desktop/JobMarket/MobileApp/app.json#L25) sets `"usesCleartextTraffic": true`.
   - **Security Impact**: Allows plain HTTP requests without TLS, rendering communications susceptible to Man-In-The-Middle (MiTM) interception and packet sniffing on public networks.
   - **Remediation**: Set `"usesCleartextTraffic": false` for production release builds. The production backend URL is strictly HTTPS (`https://jobmarket-8c0p.onrender.com`).
2. **HTTPS Enforcement in Release Code (PASS)**:
   - In [config.ts](file:///Users/yogesh/Desktop/JobMarket/MobileApp/src/api/config.ts), `getDevApiBaseUrl()` ensures that any production or non-dev build (`!__DEV__`) automatically overrides private/LAN IP addresses to `https://jobmarket-8c0p.onrender.com`.
3. **URL Parameter Injection Defense (PASS)**:
   - [client.ts](file:///Users/yogesh/Desktop/JobMarket/MobileApp/src/api/client.ts) validates URL parameters and explicitly throws errors if endpoints contain `/undefined`, `/null`, or `/NaN`.

---

## 4. Android Platform & Manifest Security (MASVS-PLATFORM)

### Verified Findings:
1. **High-Risk SYSTEM_ALERT_WINDOW Permission (DEFECT - CRITICAL)**:
   - **Finding**: [AndroidManifest.xml](file:///Users/yogesh/Desktop/JobMarket/MobileApp/android/app/src/main/AndroidManifest.xml#L5) includes:
     ```xml
     <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>
     ```
   - **Google Play Risk**: `SYSTEM_ALERT_WINDOW` is a restricted special access permission ("Display over other apps") commonly included by React Native in debug builds for dev menus. Google Play requires extensive declaration and justification for this permission in production submissions. Failure to justify results in automatic app review rejection.
   - **Remediation**: Remove `SYSTEM_ALERT_WINDOW` from production `AndroidManifest.xml`.
2. **External Storage Permissions (PASS with scoped limits)**:
   - `READ_EXTERNAL_STORAGE` and `WRITE_EXTERNAL_STORAGE` in `AndroidManifest.xml` include `android:maxSdkVersion="32"`, ensuring compliance with Android 13+ Photo Picker / Scoped Storage requirements.
3. **Deep Link Intent Filter Synchronization (DEFECT - MEDIUM)**:
   - **Finding**: `app.json` configures autoVerify App Links for `job-market-wine.vercel.app`, but `android/app/src/main/AndroidManifest.xml` has only the LAUNCHER intent filter.
   - **Remediation**: Add the browsable HTTPS `job-market-wine.vercel.app` and custom scheme `jobmarket` intent filters to `MainActivity` in `AndroidManifest.xml`.

---

## 5. Security Vulnerability Matrix

| ID | Category | Vulnerability / Defect | Severity | Remediation | Status |
| :--- | :--- | :--- | :---: | :--- | :---: |
| **SEC-01** | Platform | `SYSTEM_ALERT_WINDOW` in production manifest | **CRITICAL** | Remove from `AndroidManifest.xml` | Pending Fix |
| **SEC-02** | Network | Cleartext HTTP enabled (`usesCleartextTraffic`) | **HIGH** | Set to `false` in `app.json` | Pending Fix |
| **SEC-03** | Storage | `android:allowBackup="true"` without backup rules | **MEDIUM** | Set `android:allowBackup="false"` | Pending Fix |
| **SEC-04** | Platform | Deep link intent filters missing from manifest | **MEDIUM** | Sync intent filters from `app.json` | Pending Fix |
| **SEC-05** | Storage | Session / Token Storage via Keystore | **PASS** | Verified EncryptedSharedPreferences via SecureStore | PASS |
| **SEC-06** | Network | API Token Header Injection & Refresh Lock | **PASS** | Automated silent refresh + concurrency lock | PASS |
| **SEC-07** | Code | Hardcoded Production Keys in Mobile Repo | **PASS** | 0 secrets found across all mobile files | PASS |
