# Report H: Controlled Remediation & Retest Report

**Application**: JobMarket Mobile Application  
**Remediation Date**: October 14, 2026  
**Status**: All Safe Remediations Verified & Applied  

---

## 1. Summary of Changes Made

| Item | File Modified | Root Cause | Remediated Code | Retest Result |
| :--- | :--- | :--- | :--- | :---: |
| **REM-01** | [eas.json](file:///Users/yogesh/Desktop/JobMarket/MobileApp/eas.json) | Google Play requires `.aab` (Android App Bundle). Production profile was set to `"buildType": "apk"`. | Changed `"buildType": "apk"` -> `"buildType": "app-bundle"`. | **VERIFIED PASS** ✅ |
| **REM-02** | [AndroidManifest.xml](file:///Users/yogesh/Desktop/JobMarket/MobileApp/android/app/src/main/AndroidManifest.xml) | High-risk `SYSTEM_ALERT_WINDOW` permission triggers automatic Play Store review failure. | Removed `<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>`. | **VERIFIED PASS** ✅ |
| **REM-03** | [app.json](file:///Users/yogesh/Desktop/JobMarket/MobileApp/app.json) | Cleartext HTTP traffic was enabled via `"usesCleartextTraffic": true`. | Changed to `"usesCleartextTraffic": false`. Added `"versionCode": 1`. | **VERIFIED PASS** ✅ |
| **REM-04** | [AndroidManifest.xml](file:///Users/yogesh/Desktop/JobMarket/MobileApp/android/app/src/main/AndroidManifest.xml) | Physical data extraction risk via adb (`android:allowBackup="true"`). | Changed to `android:allowBackup="false"`. | **VERIFIED PASS** ✅ |
| **REM-05** | [AndroidManifest.xml](file:///Users/yogesh/Desktop/JobMarket/MobileApp/android/app/src/main/AndroidManifest.xml) | Missing `CAMERA` permission & missing deep link intent filters for `job-market-wine.vercel.app`. | Added `android.permission.CAMERA` and autoVerify HTTPS intent filters to `MainActivity`. | **VERIFIED PASS** ✅ |
| **REM-06** | [gradle.properties](file:///Users/yogesh/Desktop/JobMarket/MobileApp/android/gradle.properties) | Local builds defaulted to system Homebrew OpenJDK 26 instead of Java 17 LTS. | Added `org.gradle.java.home=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home`. | **VERIFIED PASS** ✅ |

---

## 2. Before & After Audit Status

| Criterion | Before Remediation | After Remediation | Impact |
| :--- | :---: | :---: | :--- |
| **Google Play Submission Format** | `.apk` (Reject) | **`.aab` (App Bundle)** | Unblocks Play Store Console upload |
| **Restricted Permissions** | `SYSTEM_ALERT_WINDOW` (Flagged) | **Removed** | Prevents policy violation strike |
| **Transport Security** | Cleartext HTTP Allowed | **Strict HTTPS Enforced** | Complies with OWASP MASVS-NETWORK |
| **Physical Sandbox Security** | `allowBackup="true"` | **`allowBackup="false"`** | Eliminates ADB backup data leaks |
| **Deep Link Native Handling** | Only LAUNCHER in manifest | **Full autoVerify filters** | Links open app natively |
| **TypeScript Typecheck** | 0 errors | **0 errors** | Zero regressions introduced |

---

## 3. Outstanding Manual Action for Developer

- **Keystore / Upload Key**:
  When submitting to the Play Store via EAS Build (`eas build --platform android --profile production`), EAS will automatically generate and manage an encrypted Android Upload Keystore in the cloud. If building standalone `.aab` files locally via Gradle, generate a production keystore via `keytool` and point `signingConfigs.release` to your `.keystore` file.
