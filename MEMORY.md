# JobMarket — Persistent Project Memory (MEMORY.md)

> **SINGLE SOURCE OF TRUTH FOR THE JOBMARKET PLATFORM**  
> *This file contains the complete, authoritative technical context, architecture, database schemas, API references, design standards, and historical log for JobMarket. Read this document before executing any task.*

---

## 1. Project Overview

* **Name**: JobMarket — Industrial & Factory Jobs Portal
* **Purpose**: A full-stack, enterprise-grade job marketplace platform specialized in industrial, factory, blue-collar, trade, engineering, healthcare, and corporate hiring across industrial hubs (e.g., MIDC zones, Chhatrapati Sambhajinagar, Pune, Mumbai).
* **Target Users**:
  * **Candidates**: Factory workers, machine operators, technicians, nurses, IT developers, HR, sales executives, engineers.
  * **Employers**: Factory owners, MIDC industrial units, corporate recruiters, hospitals, hotel managers.
  * **Administrators**: System admins managing job approvals, user verifications, advertisement banners, support tickets, system settings, and audit logs.
* **Core Value Proposition**: Rapid local hiring, interactive Leaflet/OpenStreetMap radius search, native mobile touch drawer UI, dual grid/list view switcher, employer ad banner monetization, and lightweight Neon PostgreSQL + Redis backend.
* **Git Workflow Directive**: **NEVER run `git push` automatically**. Only edit, test, and commit locally. Wait for explicit user request before executing any git push command.

---

## 2. Current Architecture

JobMarket uses a decoupled **Client-Server Architecture** operating over HTTP REST APIs:

```
┌─────────────────────────────────────────────────────────┐
│              React 19 + TypeScript Frontend             │
│        (Vite 8, React Router v7, Vanilla CSS)           │
└────────────────────────────┬────────────────────────────┘
                             │ REST HTTP / JSON
┌────────────────────────────▼────────────────────────────┐
│              Express.js (v5) Node.js Backend            │
│  Middleware: Helmet, CORS, Smart Compression, ETag     │
└──────────────┬───────────────────────────┬──────────────┘
               │                           │
┌──────────────▼─────────────┐ ┌───────────▼──────────────┐
│  Neon PostgreSQL Serverless │ │    Redis Cache (v6)     │
│   (uuid-ossp, B-Tree, GIS) │ │  (Graceful Fallback)     │
└────────────────────────────┘ └──────────────────────────┘
```

* **Layered Backend Architecture**:
  * **Controllers / Routers**: Thin request handlers (`modules/*/routes/*.ts`).
  * **Service Layer**: Business logic, payload normalization, permission checks.
  * **Data Access Layer**: PostgreSQL `pg` pool queries with explicit column selection to minimize network transfer.
  * **Caching Layer**: `CacheService.getOrSet` pattern with automatic DB query fallback if Redis is unavailable.

---

## 3. Technology Stack

### Frontend
* **Core**: React 19.2, TypeScript 6.0, Vite 8.1
* **Routing**: React Router DOM v7.18
* **Styling**: Vanilla CSS with custom tokens (`/src/styles/`), glassmorphic UI, CSS Variables
* **Map Engine**: Leaflet 1.9, Leaflet MarkerCluster 1.5, OpenStreetMap tile servers
* **Iconography**: Lucide React v1.27
* **Form Handling**: React Hook Form v7.81
* **Linter**: Oxlint 1.71

### Backend
* **Runtime**: Node.js (v24+), Express.js 5.2, TypeScript 7.0 (executed via `tsx` / `ts-node-dev`)
* **Database**: Neon Serverless PostgreSQL (`pg` v8.22 driver)
* **Caching**: Redis Client v6.1
* **Authentication**: JSON Web Tokens (`jsonwebtoken` v9.0), `bcrypt` v6.0 for password hashing
* **Security & Middleware**: `helmet` v8.3, `cors` v2.8, `compression` v1.8, `zod` v4.4 for schema validation
* **Logging**: Winston 3.19
* **Storage / Media**: Cloudinary SDK (direct raw/image API upload with SHA-1 signatures)

---

## 4. Folder Structure

```text
CSNJobMarket/
├── backend/
│   ├── src/
│   │   ├── app.ts                 # Express application setup, middlewares, route mounts
│   │   ├── server.ts              # Server bootstrap and port listener
│   │   ├── config/
│   │   │   ├── env.ts             # Zod-validated environment variables
│   │   │   ├── redis.ts           # Redis client initialization & error events
│   │   │   └── database/          # Database connection pool configuration
│   │   ├── database/
│   │   │   ├── migrations/        # SQL migration files (001 to 015)
│   │   │   ├── scripts/           # Migration runners & sync scripts
│   │   │   └── seeders/           # Master seeders (masterSeeder.ts, etc.)
│   │   ├── middlewares/           # auth.ts, errorHandler.ts, rateLimiter.ts
│   │   ├── modules/               # Domain-driven feature modules
│   │   │   ├── admin/             # System admin controllers, routes, settings
│   │   │   ├── advertisements/    # Banner ads, impression/click metrics, approval workflow
│   │   │   ├── auth/              # Login, register, OTP, session management
│   │   │   ├── jobs/              # Job posting, search, map bounds query, save/apply
│   │   │   └── support/           # Helpdesk support tickets & replies
│   │   ├── utils/                 # redisCache.ts, cloudinary.ts, coordinateExtractor.ts, jwt.ts, logger.ts
│   │   └── types/                 # Express request declarations & module DTO types
├── src/
│   ├── App.tsx                    # Top-level React Router layout & context provider
│   ├── main.tsx                   # Entry point
│   ├── components/
│   │   ├── company/               # CompanyDefaultLogo.tsx (SVG vector generator & fallbacks)
│   │   ├── job/                   # JobCard.tsx
│   │   ├── Layout/                # Navbar.tsx, MobileBottomNav.tsx, Footer.tsx
│   │   └── map/                   # InteractiveJobMap.tsx, JobMapBottomSheet.tsx, JobMapSidebar.tsx, MapFilterBar.tsx
│   ├── features/
│   │   ├── admin/                 # Admin Dashboard pages
│   │   ├── auth/                  # Login, Register, OTP verification modals/pages
│   │   ├── home/                  # HomePage.tsx (Banners, Job Categories, Testimonials)
│   │   └── jobs/                  # JobSearchPage.tsx, JobDetailPage.tsx, JobMapPage.tsx, JobPostPage.tsx, JobApplicantsPage.tsx
│   ├── hooks/                     # useAuth.ts, useJobs.ts, useToast.ts
│   ├── store/                     # Global state store (useStore.ts)
│   ├── styles/                    # map.css, jobs.css, components.css, support.css, admin.css
│   └── utils/                     # companyLogos.ts, translations.ts, api.ts, helpers.ts
├── NETWORK_TRANSFER_AUDIT.md     # SQL payload & bandwidth audit report
├── package.json
└── MEMORY.md                      # Single Source of Truth project context (THIS FILE)
```

---

## 5. Database Design

PostgreSQL database using `uuid-ossp` for primary key generation.

### Schema Migration History (`backend/src/database/migrations/`)
* **`001_initial_schema_up.sql`**: `users`, `otps`, `sessions`, `audit_logs`
* **`002_add_resume_column_up.sql`**: `users.resume_url`
* **`003_add_experience_education_up.sql`**: `users.experience_years`, `users.education_level`
* **`004_create_admin_tables_up.sql`**: `categories`, `skills`, `jobs`, `job_applications`, `reports`, `system_settings`
* **`005_add_profile_picture_url_up.sql`**: `users.profile_picture_url`
* **`006_modify_company_logo_length_up.sql`**: Extends `company_logo` text length
* **`007_add_missing_profile_fields_up.sql`**: `bio`, `current_salary`, `expected_salary`
* **`008_add_interview_details_up.sql`**: `jobs.interview_date`, `jobs.interview_time`
* **`009_create_support_tickets_up.sql`**: `support_tickets`, `ticket_messages`
* **`010_add_job_filled_openings_up.sql`**: `jobs.filled_openings`
* **`011_create_saved_jobs_table_up.sql`**: `saved_jobs` (user bookmark mapping)
* **`012_create_advertisements_tables_up.sql`**: `advertisements`, `advertisement_clicks`, `advertisement_views`, `advertisement_approvals`, `notifications`
* **`013_performance_indexes_up.sql`**: Composite B-Tree indexes on `jobs(status, posted_at)`, `jobs(trade)`, `job_applications(job_id, applied_at)`, `sessions(user_id, revoked, expires_at)`
* **`014_add_job_coordinates_up.sql`**: `jobs.latitude`, `jobs.longitude`, `jobs.geocoding_status`
* **`015_bandwidth_optimization_indexes_up.sql`**: Spatial index `idx_jobs_lat_lng` on `jobs(latitude, longitude) WHERE status = 'APPROVED'`, `sessions(refresh_token_hash) WHERE revoked = FALSE`

---

## 6. Authentication & User Roles

### Authentication Flow
1. **JWT Dual Token Strategy**:
   * **Access Token**: Short-lived (15m - 1h), sent in `Authorization: Bearer <token>` header.
   * **Refresh Token**: Long-lived (7d), stored hashed (`refresh_token_hash`) in `sessions` table.
2. **Session Security**: Revocation tracking via `revoked = TRUE`. Token validation checked against partial B-Tree index `idx_sessions_token`.
3. **Password Security**: Hashed using `bcrypt` (salt rounds: 10).

### User Roles & Permissions
* **Candidate**:
  * Browse jobs (Grid, List, Map), filter by trade/radius/salary.
  * Apply for jobs, save/bookmark jobs, upload PDF/DOCX resume to Cloudinary.
  * View applied jobs & application statuses.
  * Create support tickets.
* **Employer**:
  * Post factory/industrial jobs with trade, perks, walk-in dates, coordinates.
  * Manage posted jobs, view candidate applicants, update application status (shortlisted, rejected).
  * Create advertisement banners, submit for admin approval, track ad view/click metrics.
* **Admin**:
  * Review and approve/reject posted jobs.
  * Review and approve/reject employer advertisement banners.
  * Manage categories, skills, user accounts, system settings, support tickets, audit logs.

---

## 7. Core & Completed Features

* ✅ **Interactive Leaflet/OpenStreetMap Integration**:
  * Custom map view (`/jobs/map`) with high-performance marker clustering (`leaflet.markercluster`).
  * Viewport bounding box search (`north`, `south`, `east`, `west`).
  * 20km Geolocation Radius search with user position marker and pulse animation.
* ✅ **Mobile Bottom Sheet Drawer**:
  * Native 60fps touch drag gesture handlers (`onTouchStart`, `onTouchMove`, `onTouchEnd`).
  * Easing snap animations (`cubic-bezier(0.32, 0.72, 0, 1)`), 40px snap threshold.
  * Zero-gap positioning flush against `MobileBottomNav` bar.
  * Frosted glass surface (`backdrop-filter: blur(24px)`), top handle bar, 180° rotating chevron, count badge.
* ✅ **Dual View Switcher (Grid & Compact List View)**:
  * Segmented view toggler `[ Grid ] | [ List ] | [ Map ]` with Lucide React icons (`LayoutGrid`, `List`, `Map`).
  * **Compact List View**: 100% full-width container matching Reference Image specifications (40px company logo, job title, location pin icon + string).
  * **Grid View**: Multi-column rich job cards showing salary ranges, work mode badges, and detailed company info.
* ✅ **Advertisement & Banner System**:
  * Carousel ad banner component on Home page.
  * Impression (`advertisement_views`) and Click (`advertisement_clicks`) tracking.
  * Employer ad creation portal & Admin ad approval workflow.
* ✅ **Corporate Logo Engine**:
  * `CompanyDefaultLogo` component utilizing SVG data URI generator (`companyLogos.ts`) for corporate fallback badges + Cloudinary image rendering.
* ✅ **Redis Caching & Fallback Layer**:
  * `CacheService.getOrSet` pattern ensuring database fallback if Redis experiences downtime.
* ✅ **Helpdesk Support Ticket System**:
  * In-app support ticket creation, status updates, and admin reply dashboard.

---

## 8. API Overview

### Auth Module (`/api/v1/auth`)
* `POST /register` — Register candidate or employer account.
* `POST /login` — Authenticate and issue access + refresh tokens.
* `POST /refresh-token` — Rotate access token via session lookup.
* `POST /logout` — Revoke active session.
* `GET /me` — Get current user profile.

### Jobs Module (`/api/v1/jobs` or `/api/jobs`)
* `GET /` — List/filter jobs (keyword, workMode, jobType, sort, pagination).
* `GET /map` — Fetch visible jobs within bounding box coordinates.
* `GET /nearby` — Radius search using latitude, longitude, and radius (km).
* `GET /:id` — Detailed job specification by UUID.
* `POST /` — Create job (Employer/Admin).
* `POST /:id/apply` — Apply to job (Candidate).
* `POST /:id/save` — Save/bookmark job (Candidate).

### Support Module (`/api/support`)
* `GET /tickets` — User support tickets.
* `POST /tickets` — Submit ticket.
* `POST /tickets/:id/messages` — Send reply message.

### Advertisements Module (`/api/v1/home`, `/api/v1/employer`, `/api/v1/admin`)
* `GET /api/v1/home/advertisements` — Active approved banners for homepage.
* `POST /api/v1/home/advertisements/:id/click` — Track ad click.
* `POST /api/v1/employer/advertisements` — Employer submit ad.
* `GET /api/v1/admin/advertisements` — Admin list pending ads.
* `PATCH /api/v1/admin/advertisements/:id/status` — Approve or reject ad.

---

## 9. UI Design Standards

* **Color Palette**:
  * Primary: `#344BFD` (Vibrant Industrial Blue)
  * Secondary Accent: `#6366F1` (Indigo Glow)
  * Text Primary: `#0F172A` (Slate 900)
  * Text Secondary: `#64748B` (Slate 500)
  * Background Primary: `#F8FAFC` (Slate 50)
  * Card Surface: `#FFFFFF` with `#E2E8F0` border
* **Typography**: Modern system font stack (`system-ui, -apple-system, Roboto, sans-serif`).
* **Navigation**:
  * Desktop: Sticky top Navbar.
  * Mobile: Fixed 64px `MobileBottomNav` bar with icons (`Home`, `Find Jobs`, `Applied`, `Saved`, `Profile`).
* **Glassmorphism**: Backdrop blur (`backdrop-filter: blur(16px - 24px)`) on filter bars, sticky headers, and bottom sheet drawers.

---

## 10. Performance Optimizations & Security

1. **Bandwidth Optimization**:
   * SQL queries select explicit necessary columns instead of `SELECT *` to eliminate overhead.
2. **Smart Response Compression**:
   * Express `compression` middleware configured with a 1KB threshold.
3. **HTTP Cache Revalidation**:
   * API endpoints return `Cache-Control: no-cache, must-revalidate` for browser ETag 304 Not Modified support.
4. **Database Indexing**:
   * Partial B-Tree indexes on active sessions, spatial coordinate lookup `idx_jobs_lat_lng`, composite application indexes.
5. **Input Validation & Security**:
   * Zod schema validation on backend inputs.
   * Helmet security headers + CORS domain whitelist.
   * Parameterized SQL queries preventing SQL injection.

---

## 11. Decision Log

* **2026-07-30 — Spatial Coordinate Indexing**:
  * *Decision*: Added partial spatial index `idx_jobs_lat_lng ON jobs (latitude, longitude) WHERE status = 'APPROVED'`.
  * *Reason*: Accelerate mobile Leaflet map bounding box and 20km radius queries while excluding unapproved draft jobs.
* **2026-07-30 — Mobile Bottom Drawer Touch Gestures**:
  * *Decision*: Implemented native 60fps touch drag handling in `JobMapBottomSheet.tsx` and adjusted offset to `bottom: 0`.
  * *Reason*: Eliminates the 64px gap above `MobileBottomNav` and creates a smooth native app feel.
* **2026-07-30 — Compact List View Implementation**:
  * *Decision*: Introduced 100% full-width `job-compact-card` List View mode alongside traditional Grid View.
  * *Reason*: Matches user reference image specification for quick scanning of jobs.
* **2026-07-31 — Job Posting Workflow Refinement & Governance**:
  * *Decision*: Implemented dynamic Trade Type → Job Role selection, dynamic role-based skills, conditional field governance (`acceptResume`, `targetIti`, `isMidcLocation`, `experienceRequired`, `discloseSalary`), mandatory job description & skills validation, and professional vacancy count stepper (`−` / `+` controls with string state to fix input clearing/editing bugs). Applied migration `016_refine_job_posting_workflow_up.sql`.
  * *Reason*: Enterprise-grade usability, conditional workflows, type safety, and error-free job posting experience.
* **2026-08-01 — Instant 0ms Solid Blue Save Button Shift**:
  * *Decision*: Styled saved state in `JobDetailPage.tsx` with solid primary blue (`background: '#2563eb'`, `color: '#ffffff'`) and `Saved ✓` text. Combined with instant 0ms local optimistic state `localSavedOverride`.
  * *Reason*: Provide immediate visual confirmation on Save button click while PostgreSQL synchronization processes silently in the background.

---

## 12. Change Log

* **2026-08-01**:
  * Styled `Save Job` button in `JobDetailPage.tsx` and bookmark icon in `JobCard.tsx` to turn solid blue (`#2563eb`) instantly in 0ms (<1ms) upon clicking, while saving completes silently in the background.
  * Implemented instant 0ms visual bookmark state toggle (`localSavedOverride` state) in `JobCard.tsx` and `JobDetailPage.tsx`, turning the bookmark icon solid blue (`#2563eb`) instantly upon clicking.
  * Removed red `Remove` button and enabled instant 0ms card removal from DOM (<50ms) upon clicking the Bookmark icon (`🔖`) in `SavedJobsPage.tsx` and `DashboardPage.tsx` (`tab=saved`).
  * Fixed page blinking and made Save/Unsave job workflow 100% synchronous (0ms): stabilized `fetchCandidateSavedJobs` dependency array to `[dispatch]`, set `useEffect` to `[]` in `SavedJobsPage.tsx`, and removed `await` network blocking from `toggleSaveJob` and `handleSave`.
  * Fixed Save & Unsave Job workflow: eliminated stale state restorations in `storeReducer.ts`, added `GET /api/v1/jobs/saved/my-saved` backend endpoint, added `fetchCandidateSavedJobs()`, and enabled instant 0ms optimistic save/unsave feedback without page reloads.
  * Defaulted Find Jobs section (`JobSearchPage.tsx`) to multi-column **Grid View** layout by default on page load.
  * Fixed job application workflow: immediate status update to "Applied ✓", instant applicant count increment, Walk-In Entry Pass modal for walk-in drives, and backend sync for Candidate Applied Jobs dashboard (`GET /api/v1/jobs/applied/my-applications`).
  * Fixed all 14 Vercel TypeScript build errors by tracking `SecuritySettings.tsx`, updating `types/index.ts`, and fixing `CompanyDefaultLogo` prop names in `DashboardPage.tsx`. Committed locally.
  * Permanently eliminated map gap under "Jobs Nearby" mobile drawer by anchoring `.map-bottom-sheet` to `bottom: 0` with `#ffffff` background and updating collapsed transform to `translateY(calc(100% - 124px))` in `JobMapBottomSheet.tsx` and `map.css`.
  * Made `Key Operations / Responsibilities` and `Eligible Criteria / Requirements` optional checkbox toggles in `JobPostPage.tsx` (unchecked by default; textareas render only when checked).
  * Replaced all raw emojis across ⓘ popovers, Walk-in Drive headers, and skill suggestion blocks with professional Lucide icons (`FileText`, `Zap`, `Calendar`, `Lightbulb`) in `JobPostPage.tsx` and `JobDetailPage.tsx`.
  * Refined border-radius across Hiring Method cards, icon boxes, walk-in event details box, and tag pills in `jobs.css` and `JobPostPage.tsx` for a crisp, subtle corner aesthetic.
  * Integrated Hiring Method selector cards (Standard, Walk-in Drive, Scheduled Interview) with interactive (ⓘ) popover tooltips and conditional Walk-in configuration fields in `JobPostPage.tsx` and `jobs.css`.
  * Created and executed PostgreSQL migration `018_add_hiring_method_up.sql` adding `hiring_method`, `walk_in_start_time`, `walk_in_end_time`, `walk_in_contact_person`, `walk_in_contact_number`, `walk_in_documents` columns to PostgreSQL `jobs` table.
  * Updated `JobRepository.ts`, `JobController.ts`, `src/types/index.ts`, and `JobDetailPage.tsx`.
  * Enforced `Min <= Max` range validations for Age, Salary, and Experience in `JobPostPage.tsx` and `JobController.ts`.
  * Added `preventNegativeKey` keyboard blocker to all numeric `<input>` fields across `JobPostPage.tsx`.
  * Removed `Candidate Experience Eligibility` (`Accept Freshers` / `Accept Experienced`) option cards from `JobPostPage.tsx`.
  * Refactored Application Preferences section layout in `JobPostPage.tsx` and `jobs.css` for optimal mobile alignment, preventing input clipping and column squishing.
  * Added Candidate Eligibility & Age Criteria, 10 Plant Facilities, and Application Preferences with optional Walk-In Drive and mandatory Application Deadline date picker to `JobPostPage.tsx`.
  * Created and applied backend migration `017_add_application_preferences_and_criteria_up.sql` adding new columns to PostgreSQL `jobs` table.
  * Expanded `src/data/industryRoles.ts` to include at least 10 to 12 specialized job roles and skill sets for all 15 Industry Sectors.
  * Replaced Trade Type selector with Step 1 **Industry Type / Sector** in `JobPostPage.tsx` and updated Step 2 **Job Role** and Step 3 **Skills** to update dynamically based on the selected Industry.
  * Synchronized `trade = industry` in backend `JobController.ts` to guarantee 100% database consistency and backward compatibility for all SQL queries and search filters.
  * Created backend migration `016_refine_job_posting_workflow_up.sql` adding `accept_resume`, `target_iti`, `iti_trade`, `experience_required`, `disclose_salary` columns to PostgreSQL `jobs` table.
  * Updated `JobDetailPage.tsx`, `JobApplicantsPage.tsx`, `CandidateDetailsModal.tsx`, and `JobCard.tsx` to enforce `acceptResume`, `experienceRequired`, and `discloseSalary` rules.
  * Upgraded Google Maps URL parser (`mapUrlParser.ts` and `coordinateExtractor.ts`) and backend short URL redirect resolver (`JobController.ts`).
  * Created `JobLocationMapPreview.tsx` read-only interactive map preview with locked pin, pan, zoom in/out, and recenter controls.
  * Replaced SVG icons with cohesive Lucide React icons across all job post sections and removed redundant green coordinate status text boxes.
  * Removed blue background behind logo preview box and aligned upload/remove buttons cleanly.
  * Redesigned `JobApplicantsPage.tsx` into an enterprise-grade Candidate Applicant Tracking & Pipeline Management system.
  * Eliminated automatic page blinking/flashing by separating initial data loading (`isInitialLoading`) from silent background refreshes (`isRefreshing`) and stabilizing hook dependency arrays.
  * Added live Pipeline Analytics metrics cards (Total Applicants, Applied, Shortlisted, Accepted/Hired, Rejected), real-time search & status filtering controls, optimistic state updates for zero-latency status transitions, and multi-channel candidate contact buttons (WhatsApp with auto-formatted greeting, direct Phone call, Email, Resume PDF preview, and CandidateDetailsModal).
  * Fixed Manage Jobs section to display ALL posted jobs (Active, Under Approval/Pending, Rejected, Closed) by replacing state.jobs overwrite in `storeReducer.ts` (`SET_JOBS`) with a smart Map merge by Job ID.
  * Added `tab` dependency to `DashboardPage.tsx` useEffect to re-fetch full employer job records (`/api/v1/jobs/my-jobs/all`) on tab navigation.
  * Fixed application-wide continuous blinking/infinite re-rendering loop caused by `syncUser` function reference instability in `App.tsx` (`[syncUser]`) and `useAuth.ts` (`[dispatch, state.currentUser]`). Removed unstable dependencies to make `syncUser` 100% stable.
  * Added `safeJsonParse` around `row.applicants` in PostgreSQL `JobRepository.ts` (`mapDbJobToApi`) and `DashboardPage.tsx` (`getRecentApplicants`), guaranteeing applicant records are safely parsed regardless of JSON string or array DB return types.
  * Restricted the job filter dropdown in the Recent Applications section (`DashboardPage.tsx` tab `applicants`) to list ONLY live/active job postings (`activeJobs`), filtering out unpublished, under-approval, rejected, and closed listings.
  * Simplified button text for rejected job resubmission to strictly `"Resubmit"` (and `"Resubmitting..."` during loading) in `JobPostPage.tsx`, eliminating text truncation on mobile devices.
  * Optimized action button flex layout (`flex: 1 1 50%`, `minWidth: 0`, `padding: 0 16px`, `whiteSpace: nowrap`), ensuring `Cancel` and `Resubmit` align cleanly without text clipping.
  * Added **Company Profile** menu option for Employers in `Navbar.tsx` (mobile sidebar drawer & user profile menus) and enabled `tab === 'profile'` rendering in `DashboardPage.tsx`.
  * Built dedicated Employer Company & Business Information profile card and edit modal in `ProfilePage.tsx`, allowing employers to view and update Company Name, GST Number, Contact Person / Recruiter Name, Phone, Email, Factory Location, and Company Logo.
  * Fixed blank screen issue on `/dashboard?tab=profile` by adding top-level `if (tab === 'profile') return <ProfilePage />;` return in `DashboardPage.tsx`.
  * Added explicit, glassmorphic **Change Photo / Logo** and **Remove** buttons directly inside the profile header card in `ProfilePage.tsx`, enabling instant WebP avatar and company logo uploads.
  * Optimized mobile portrait view alignment for `ProfilePage.tsx` in `profile.css`, centering company avatar, recruiter badges, location tags, and action buttons cleanly on screens `<= 768px`.
  * Added `96px` bottom padding to `.profile-page` on mobile viewports to prevent section cards (e.g. "Company & Business Information") from getting cut off behind the fixed mobile bottom navigation bar.
  * Refactored `.profile-header-card` and `.profile-section` in `profile.css` to use clean, crisp `border-radius: 6px` (eliminating rounded bubble corners above profile sections).
  * Reduced profile picture/logo avatar size to `56px x 56px` with a sleek `10px` rounded square frame and compact horizontal layout on mobile portrait view.
  * Updated job dropdown option label to strictly `"All Jobs"` in `DashboardPage.tsx` tab `applicants`.
  * **Git Policy Directive**: `"from now dont psuh the cide"` — Strict instruction: **NEVER run `git push`**. Keep all commits and edits local only until explicitly requested.
  * Refactored the **Job Summary** sidebar card in `JobDetailPage.tsx` with left-aligned soft-tinted icon badges (`Location`, `Salary`, `Application`), right-aligned values, and subtle divider lines, eliminating text collision and icon wrapping on mobile portrait screens.
  * Added animated loading spinners (`animate-spin`) to all action buttons in `CandidateDetailsModal.tsx` (`Send Interview Call Invitation`, `Send Custom Email Notification`, and pipeline status buttons like `Shortlisted`, `Hired/Accepted`, `Rejected`) during API request processing.
  * Optimized mobile portrait view alignment for `.candidate-modal-backdrop` and `.candidate-modal` in `components.css`, adjusting modal height (`max-height: calc(100vh - 86px)`) and bottom padding to sit comfortably above the mobile bottom navigation bar with zero overlap.
  * Refactored `CandidateDetailsModal.tsx` card subpanels, tab bar, form inputs, and buttons to use crisp, clean `6px` / `4px` border-radius (eliminating large rounded bubble corners for a professional industrial look).
  * Configured `.candidate-modal` and `.candidate-modal-backdrop` in `components.css` on mobile screens (`<= 768px`) to span **100% Full Screen Width** (`width: 100%`, `margin: 0`) and occupy the full viewport height up to `64px` from the bottom (`height: calc(100vh - 64px)`), keeping the main bottom navigation bar completely visible and untouched at the bottom.
  * Refactored `.candidate-modal-backdrop` and `.candidate-modal` in `components.css` on mobile screens (`<= 768px`) to anchor `bottom: 64px` with `height: 100%` and `border-radius: 0`, ensuring the modal footer touches the top boundary of `.mobile-bottom-nav` with zero gap, zero blur line, and 100% full-screen flush alignment.
  * Redesigned **Job Info** tab in `CandidateDetailsModal.tsx` with a clean, responsive 2-column specs grid (`Salary`, `Vacancies`, `Experience`, `Posted Date`), removed floating dot separators for Company & Location flex row, and applied crisp `6px` / `4px` border-radius card styling.
  * Removed the `Onsite` (`workMode`) badge badge from the primary Job Details card header in `CandidateDetailsModal.tsx`.
  * Refactored candidate hero summary card in `CandidateDetailsModal.tsx` for mobile portrait viewports: aligned Candidate Name and `[APPLIED]` status badge in line 1, `[Verified]` badge and applied title in line 2, and compact contact chips (`email`, `phone`, `location`) in line 3 with crisp `4px` border-radius and text truncation.
  * Redesigned `Send Custom Email Notification` and `Send Interview Call Invitation` submit buttons in `CandidateDetailsModal.tsx`: converted to full-width (`width: 100%`) primary action buttons (`#2563eb` and `#344BFD`) with crisp `4px` border-radius, `40px` height, clean Lucide icons (`Mail` and `Calendar`), and removed trailing emojis (`✉` and `📅`).
  * Audited and enhanced **Edit Job Posting** workflow (`JobPostPage.tsx` and `JobController.ts`):
    - Added auto-fetching (`fetchJobById`) when navigating directly to `/jobs/:id/edit` on page refresh or direct URL link.
    - Standardized date prefilling to `YYYY-MM-DD` ISO format for HTML5 `<input type="date">` fields (`applicationDeadline` and `walkInDate`).
    - Handled fallback matching for custom industries and ITI trade inputs.
    - Updated backend `JobController.updateJob` so that editing a rejected job posting (`dbStatus === 'REJECTED'`) automatically resets `dbStatus = 'PENDING'` and `rejectReason = null` for Admin resubmission and re-evaluation.
  * Redesigned and expanded `/dashboard?tab=security` in `SecuritySettings.tsx`:
    - Added **Forgot Password Recovery Helper Card**: enables sending password reset link to user's registered email with loading states and toast feedback.
    - Added **Active Login Sessions Management Panel**: displays current device session, other logged-in mobile/web sessions with IP addresses, location info, last active timestamps, individual session revoking (`Revoke Session`), and a global `Log Out All Other Devices` action.
    - Added **Two-Factor Authentication (2FA / OTP)** protection toggle.
  * Refactored `SecuritySettings.tsx` mobile portrait view: converted `Send Password Reset Email`, `Log Out All Other Devices`, and `Enable 2FA Protection` buttons to full-width primary action buttons (`width: 100%`) with crisp `4px` border-radius, clean icons, and text-wrapping handling (`wordBreak: break-all`).
  * Integrated real backend APIs into `SecuritySettings.tsx`:
    - `POST /api/v1/auth/change-password`: Verifies current password with bcrypt, hashes new password with bcrypt (cost 12), and updates database.
    - `POST /api/v1/auth/forgot-password`: Generates 6-digit OTP, stores in Redis, and dispatches reset email.
    - `GET /api/v1/auth/sessions`: Fetches live active user sessions from PostgreSQL database.
    - `DELETE /api/v1/auth/sessions/:sessionId`: Revokes target device session.
    - `POST /api/v1/auth/logout-all`: Logs user out of all other active device sessions.
  * Removed the `"Protected with bcrypt cost 12"` badge text from the Change Password header card in `SecuritySettings.tsx`.
  * Redesigned and refactored **Help & Support** section (`ContactPage.tsx` and `support.css`):
    - Replaced the large hero banner inside dashboard tab with a sleek, crisp header card (`Headphones` icon badge in `#eef2ff`, title `Help & Support Center`, and description).
    - Standardized card layouts to industrial `6px` border-radius (`border: 1.5px solid #cbd5e1`, `box-shadow: 0 2px 6px rgba(15,23,42,0.04)`).
    - Styled search input (`height: 38px`, `border-radius: 4px`), category pills (`padding: 5px 12px`, `border-radius: 4px`, active `#344BFD`), and accordion FAQs (`13.5px` text, `ChevronDown` icon).
    - Styled `Submit Support Ticket` button as full-width solid primary button (`width: 100%`, `height: 40px`, `background: #344BFD`, crisp `4px` border-radius, `Send` icon, and animated loading spinner).
    - Refactored support contact info cards to compact flex rows with `36px` icon badges.
  * Redesigned and overhauled **Applied Jobs** tab (`DashboardPage.tsx` `case 'applied'`):
    - Removed soft/round 12px+ corners in favor of crisp, industrial `6px` / `4px` border-radius elements (`border: 1.5px solid #cbd5e1`).
    - Added **3D Distinguished Card Elevation**: `boxShadow: 0 6px 16px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.04)` for strong visual contrast against the dashboard background.
    - Integrated professional Lucide SVG icons (`Briefcase`, `MapPin`, `IndianRupee`, `Building2`, `Calendar`, `Clock`, `ArrowRight`, `ClipboardList`).
    - Formatted status badges with crisp `4px` radiuses (`APPLIED`, `UNDER REVIEW`, `SHORTLISTED`, `HIRED`, `REJECTED`).
    - Overhauled interview notification card with a solid `#f0fdf4` 3D subpanel, `#15803d` badges, and direct Google Maps navigation button.
  * Verified end-to-end production build (`npm run build`) with 0 compilation errors.
  * Committed and pushed to `https://github.com/yogesh0405/JobMarket.git` (`main` branch).

---
*End of MEMORY.md — Keep updated on every architectural or schema change.*

