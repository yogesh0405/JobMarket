# JobMarket Mobile Application 🚀

Production-grade Expo React Native Mobile Application for JobMarket industrial workforce portal.

---

## ⚡ Quick Start (Fresh Clone Setup)

This project requires **zero manual configuration** out-of-the-box. When cloned, it automatically targets the **live production Render backend API** (`https://jobmarket-ongn.onrender.com`).

### 1. Install Dependencies
```bash
cd MobileApp
npm install
```
> **Note:** The `postinstall` hook (`node scripts/patch-expo-cli.js`) runs automatically upon `npm install` to optimize Metro packager performance and offline startup.

### 2. Start the App
```bash
npm start
```
Or target specific platforms:
```bash
npm run android # Run on Android Emulator / Physical Device
npm run ios     # Run on iOS Simulator / Physical Device
npm run web     # Run in Browser Web View
```

---

## 🌐 Backend API Configuration

- **Default Live Backend URL**: `https://jobmarket-ongn.onrender.com`
- **Fallback Logic**: Configured in `src/api/client.ts`. If `EXPO_PUBLIC_API_URL` is omitted, the app defaults to the live production server automatically.
- **Custom Backend URL (Optional)**: You can override the backend URL in `.env`:
  ```env
  EXPO_PUBLIC_API_URL=https://jobmarket-ongn.onrender.com
  ```

---

## 🔌 Mobile Application API Endpoints

All API requests are routed through `apiFetch` in [`src/api/client.ts`](src/api/client.ts), automatically injecting Bearer JWT tokens and handling unauthorized token refresh requests seamlessly.

### 1. Auth & Session Management (`src/api/authApi.ts`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Candidate & Employer Login |
| `POST` | `/api/v1/auth/signup` | Register new account (Candidate or Employer) |
| `POST` | `/api/v1/auth/google` | Google OAuth Authentication |
| `POST` | `/api/v1/auth/verify-otp` | Verify email OTP code |
| `POST` | `/api/v1/auth/forgot-password` | Request password reset OTP |
| `POST` | `/api/v1/auth/reset-password` | Reset password using OTP code |
| `GET` | `/api/v1/auth/me` | Fetch active user profile details |
| `PUT` | `/api/v1/auth/profile` | Update profile information & resume visibility |
| `POST` | `/api/v1/auth/change-password` | Change user password |
| `GET` | `/api/v1/auth/sessions` | Fetch active login sessions |
| `DELETE` | `/api/v1/auth/sessions/:sessionId` | Revoke a specific active session |
| `POST` | `/api/v1/auth/logout` | Logout current session |
| `POST` | `/api/v1/auth/logout-all` | Terminate all other active login sessions |
| `POST` | `/api/v1/auth/refresh` | Auto-refresh access token via refresh token |
| `POST` | `/api/v1/auth/2fa/toggle` | Enable or disable 2FA security |
| `POST` | `/api/v1/auth/2fa/verify-login` | Verify 2FA OTP during login |

### 2. Jobs & Listings (`src/api/jobsApi.ts`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/jobs` | Search & list public job openings |
| `GET` | `/api/v1/jobs/my-jobs/all` | Fetch employer's posted jobs |
| `GET` | `/api/v1/jobs/:id` | Get details of a single job post |
| `POST` | `/api/v1/jobs` | Create a new job posting |
| `PUT` | `/api/v1/jobs/:id` | Update an existing job posting |
| `DELETE` | `/api/v1/jobs/:id` | Delete a job posting |
| `POST` | `/api/v1/jobs/resolve-map-url` | Geocode Google Maps share URL to coordinates |
| `GET` | `/api/v1/jobs/meta/categories` | Fetch job category options |
| `GET` | `/api/v1/jobs/meta/skills` | Fetch job skill tags |

### 3. Candidate Operations & Resume (`src/api/candidateApi.ts`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/jobs/applied/my-applications` | Fetch candidate's job applications and interview status |
| `GET` | `/api/v1/jobs/saved/my-saved` | Fetch candidate's bookmarked jobs |
| `POST` | `/api/v1/jobs/:id/save` | Bookmark or remove job bookmark |
| `POST` | `/api/v1/jobs/:id/apply` | Submit job application with optional note/resume |
| `POST` | `/api/v1/auth/profile/picture` | Upload profile avatar to Cloudinary & DB |
| `DELETE` | `/api/v1/auth/profile/picture` | Delete profile avatar |
| `GET` | `/api/v1/auth/resume/signature` | Obtain Cloudinary direct upload signature |
| `POST` | `/api/v1/auth/resume` | Save Cloudinary resume document URL |
| `DELETE` | `/api/v1/auth/resume` | Delete uploaded resume document |
| `GET` | `/api/v1/jobs/interviews/my-interviews` | Fetch upcoming & past interview schedules |
| `GET` | `/api/v1/public/settings` | Fetch system configuration settings |

### 4. Employer Applicants Management (`src/api/applicantsApi.ts` & `src/screens/candidates/`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/jobs/:jobId/applicants` | List all applicants for a specific job |
| `PATCH` | `/api/v1/jobs/:jobId/applicants/:userId/status` | Update candidate status (`shortlisted`, `hired`, `rejected`) |
| `POST` | `/api/v1/jobs/:jobId/applicants/:userId/interview` | Schedule interview date, venue, and map link |
| `POST` | `/api/v1/jobs/:jobId/applicants/:userId/email` | Send custom email notification to applicant |
| `GET` | `/api/v1/jobs/workers/all` | Search industrial candidate talent pool |

### 5. Employer Advertisements & Banners (`src/screens/advertisements/`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/employer/advertisements` | Fetch employer's banner ad list |
| `GET` | `/api/v1/employer/advertisements/analytics` | Fetch banner impression & click metrics |
| `POST` | `/api/v1/employer/advertisements` | Submit new banner advertisement |
| `PUT` | `/api/v1/employer/advertisements/:id` | Update banner advertisement details |
| `DELETE` | `/api/v1/employer/advertisements/:id` | Delete banner advertisement |

### 6. Notifications System (`src/api/notificationApi.ts`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/notifications` | Fetch user notifications |
| `PATCH` | `/api/v1/notifications/:id/read` | Mark single notification as read |
| `PATCH` | `/api/v1/notifications/read-all` | Mark all user notifications as read |
| `DELETE` | `/api/v1/notifications/:id` | Delete single notification |
| `DELETE` | `/api/v1/notifications/clear-all` | Clear all user notifications |

### 7. Support Desk & Tickets (`src/screens/profile/HelpSupportScreen.tsx`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/support/tickets` | Fetch user support ticket history |
| `POST` | `/api/support/tickets` | Create a new helpdesk support ticket |
| `GET` | `/api/support/tickets/:id` | Get ticket conversation & messages |
| `POST` | `/api/support/tickets/:id/messages` | Send message/screenshot attachment on a ticket |

---

## 📁 Project Architecture

- **`src/api/`**: Canonical API clients connecting to Live Render Backend (`authApi`, `jobsApi`, `candidateApi`, `applicantsApi`, `notificationApi`)
- **`src/screens/`**: UI screens grouped by feature domain (`auth`, `candidate`, `jobs`, `candidates`, `advertisements`, `notifications`, `dashboard`, `profile`)
- **`src/components/`**: Reusable clean design UI components, cards, headers, modal sheets, and skeleton loaders
- **`src/context/`**: Global state management (`AuthContext`, `ToastContext`)
- **`src/utils/`**: Secure token storage (`secureStorage.ts`), logging (`logger.ts`), and helper utilities

---

## ✅ Quality & Reliability Checks

- **TypeScript Verification**:
  ```bash
  npx tsc --noEmit
  ```
