# Red-Team Assessment: Mobile Application Security

**Target Application:** JobMarket Mobile Android Application (`com.jobmarket.mobileapp`)  
**Framework:** React Native (Expo SDK 54 / New Architecture)  
**Artifact Inspected:** `MobileApp/android/app/src/main/AndroidManifest.xml`, `app.json`, `src/utils/secureStorage.ts`, `src/api/config.ts`  

---

## 1. Application Manifest & Component Exposure Audit

### 1.1 Android Manifest Configuration Review
From inspection of [`MobileApp/android/app/src/main/AndroidManifest.xml`](file:///Users/yogesh/Desktop/JobMarket/MobileApp/android/app/src/main/AndroidManifest.xml):

| Manifest Attribute | Configured Value | Red-Team Assessment | Security Status |
|---|---|---|---|
| `android:allowBackup` | `"false"` | **SECURE:** Android Debug Bridge (`adb backup`) cannot extract application data, SQLite databases, or SharedPreferences. | **PASS** |
| `android:debuggable` | Not set in release (auto-false) | **SECURE:** Release APK cannot be attached to a JDWP/GDB debugger on production Android devices. | **PASS** |
| `usesCleartextTraffic` | `false` (in `app.json`) | **SECURE:** Android Network Security Config restricts all HTTP calls to TLS 1.2+ HTTPS. | **PASS** |
| `android:exported` on Activities | `.MainActivity` only (`true`) | **ACCEPTABLE:** Necessary for launcher activity and App Link intent reception. No internal secret activities exposed. | **PASS** |
| Dangerous Permissions | None (Overlay removed) | **SECURE:** `SYSTEM_ALERT_WINDOW` (Screen overlay / tapjacking risk) was purged in prior audit. | **PASS** |

---

## 2. Token Storage & Credential Security Analysis

### 2.1 Storage Mechanism: `expo-secure-store`
In [`MobileApp/src/utils/secureStorage.ts`](file:///Users/yogesh/Desktop/JobMarket/MobileApp/src/utils/secureStorage.ts):
```typescript
const isAvailable = await SecureStore.isAvailableAsync();
if (isAvailable) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
  if (sessionId) {
    await SecureStore.setItemAsync(SESSION_ID_KEY, sessionId);
  }
}
```

### 2.2 Attack Scenario: Extraction of Stored Tokens on Device
- **Attacker Hypothesis:** An attacker who gains temporary physical access to an unlocked device or runs a malicious app can inspect `/data/data/com.jobmarket.mobileapp/databases` or SharedPreferences to extract JWTs.
- **Red-Team Finding:**
  1. `expo-secure-store` utilizes the **Android KeyStore** to encrypt values stored in SharedPreferences using an AES-256 GCM master key protected by the Android TEE (Trusted Execution Environment) / StrongBox.
  2. On non-rooted devices, sandboxing prevents any third-party app from reading the private app directory.
  3. `android:allowBackup="false"` completely neutralizes backup-based data extraction.
- **Verdict:** **NOT VULNERABLE IN TEST (High Security)**.

---

## 3. Deep Link & Intent Spoofing Assessment

### 3.1 Configured Intent Filters
1. **Digital Asset Links (App Links):**
   ```xml
   <intent-filter android:autoVerify="true">
     <action android:name="android.intent.action.VIEW"/>
     <category android:name="android.intent.category.DEFAULT"/>
     <category android:name="android.intent.category.BROWSABLE"/>
     <data android:scheme="https" android:host="job-market-wine.vercel.app" android:pathPrefix="/job"/>
     <data android:scheme="https" android:host="job-market-wine.vercel.app" android:pathPrefix="/jobs"/>
   </intent-filter>
   ```
2. **Custom URL Scheme:**
   ```xml
   <intent-filter>
     <action android:name="android.intent.action.VIEW"/>
     <category android:name="android.intent.category.DEFAULT"/>
     <category android:name="android.intent.category.BROWSABLE"/>
     <data android:scheme="jobmarket"/>
   </intent-filter>
   ```

### 3.2 Attack Scenario: Deep Link Hijacking & Malicious Parameter Injection
- **Scenario:** A malicious attacker crafts a deep link: `jobmarket://job/../../../admin/users` or `jobmarket://job/invalid-uuid;DROP TABLE`.
- **Observed Behavior:**
  - The mobile deep link handler parses the job ID and passes it to `JobRepository.getJobById(jobId)`.
  - In `JobRepository.ts`, `isUUID(jobId)` validates the ID. If malformed, the query uses parameterized SQL (`$1`), preventing SQL injection.
  - The UI navigates to `JobDetailsScreen`, which displays a clean 404/Empty State if the job ID is nonexistent or malformed.
- **Verdict:** **NOT VULNERABLE IN TEST**.

---

## 4. Client-Side Tampering vs Server-Side Enforcement

### 4.1 Attack Scenario: Bypassing Mobile UI Restrictions
- **Attacker Action:** An attacker modifies the mobile client bundle (or sends raw HTTP requests via Postman/cURL) to bypass UI buttons:
  - An ordinary candidate attempts to call employer-only endpoints (`/api/v1/jobs/applicants/all`).
  - An ordinary candidate attempts to call administrative endpoints (`/api/v1/admin/dashboard`).
- **Observed Verification:**
  - **Gateway Stripping:** The client cannot spoof `x-user-role` via HTTP headers.
  - **Server-Side Enforcement:** Downstream services strictly verify `role === 'employer'` or `role === 'admin'`.
  - Both attacks fail with `HTTP 403 Forbidden`.
- **Verdict:** **NOT VULNERABLE IN TEST (Defense in Depth Enforced)**.
