# Report G: Google Play Store Readiness & Policy Compliance Checklist

**Package ID**: `com.jobmarket.mobileapp`  
**Google Play Requirement Standard**: 2026 Target API Level & Policy Guidelines  
**Assessment Date**: October 14, 2026  

---

## 1. Google Play Technical Compliance

| Policy / Technical Gate | Requirement | Current App State | Status | Action Required |
| :--- | :--- | :--- | :---: | :--- |
| **Package Format** | Android App Bundle (`.aab`) mandatory since Aug 2021 | `eas.json` has `"buildType": "apk"` in production | **FAIL** 🚨 | Change to `"buildType": "app-bundle"` in `eas.json` |
| **Target API Level** | Target API 34+ required for new apps / updates | `targetSdkVersion: 36` (Android 16) | **PASS** ✅ | Meets and exceeds Google Play requirements |
| **Minimum API Level** | Reasonable Android device compatibility | `minSdkVersion: 24` (Android 7.0 Nougat) | **PASS** ✅ | Supports >95% of active global Android devices |
| **Version Code & Name** | Integer `versionCode` + semver `versionName` | `versionCode 1`, `versionName "1.0.0"` in Gradle | **PASS** ✅ | Ensure `versionCode: 1` is also mirrored in `app.json` |
| **64-bit Architecture** | 64-bit native code (arm64-v8a, x86_64) | `reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64` | **PASS** ✅ | Full 64-bit CPU architecture coverage |
| **Release Signing** | Signed with valid production upload certificate | `debug.keystore` used in local `build.gradle` | **WARNING** ⚠️ | Use EAS Cloud Managed Key or configure production upload keystore |
| **Debuggable Flag** | `android:debuggable="false"` in release build | Enabled only in debug build variant | **PASS** ✅ | Automated by Android Gradle Plugin release pipeline |

---

## 2. Google Play Content & Permission Policies

| Policy Gate | Evaluation | Status | Action Required |
| :--- | :--- | :---: | :--- |
| **System Alert Window** | Restricted permission ("Display over other apps"). Triggers rejection unless strictly justified | **FAIL** 🚨 | **Remove** `android.permission.SYSTEM_ALERT_WINDOW` from `AndroidManifest.xml` |
| **Cleartext Traffic Policy** | Plain HTTP discouraged on Android 9+ (API 28+) | **FAIL** 🚨 | Change `"usesCleartextTraffic": false` in `app.json` |
| **Storage Permissions** | Scoped storage / Photo Picker enforcement | **PASS** ✅ | `READ/WRITE_EXTERNAL_STORAGE` capped with `android:maxSdkVersion="32"` |
| **Camera & Microphone** | Runtime permission prompt with clear explanation | **PASS** ✅ | `photosPermission`, `cameraPermission`, and `microphonePermission` declared in `app.json` |
| **Account Deletion** | Mandatory in-app and web account deletion link for apps with account creation | **PASS** ✅ | Security Settings includes session revocation & account deletion routes |
| **Deep Link Verification** | Android App Links with SHA-256 assetlinks.json | **PARTIAL** ⚠️ | `app.json` has `autoVerify: true`; `AndroidManifest.xml` needs intent filters synchronized |
| **Data Safety Declaration** | Accurate declaration of collected user data | **READY** ℹ️ | Complete Play Console form: User credentials, location (optional search), profile photos |
| **Privacy Policy URL** | Active public privacy policy accessible via browser | **READY** ℹ️ | Point to `https://job-market-wine.vercel.app/privacy` in Play Console listing |
