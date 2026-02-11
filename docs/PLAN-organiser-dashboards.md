# PLAN: Organiser Dashboards and Reports (Spec 005)

Implementation strategy for organiser-facing admin tools, including authentication, statistics, attendance management, and reporting.

## 🔴 User Review Required

> [!IMPORTANT]
> **Authentication Move**: I will be implementing a full magic-link authentication flow for the admin dashboard as requested. This will replace the current placeholder token.
> **Unified Registration View**: I've decided to unify the "Registrations" and "Missing Registrations" into one master view with powerful filters (e.g., Status: Missing, In Progress, Completed). This is more scalable than separate pages.

## Proposed Changes

### [Admin Infrastructure]

#### [NEW] [admin-auth.ts](file:///c:/Users/lloyd/Sync/Swedish%20Camp%20Command/web/src/lib/admin-auth.ts)
- [P] Logic for generating/verifying admin session tokens (JWT or secure cookies).
- [P] Interface for checking authorized organiser emails against environment variables.

#### [MODIFY] [middleware.ts](file:///c:/Users/lloyd/Sync/Swedish%20Camp%20Command/web/src/middleware.ts)
- [P] Update to use the new authentication logic for `/admin` and `/api/admin` routes.

#### [NEW] [/api/admin/auth/login](file:///c:/Users/lloyd/Sync/Swedish%20Camp%20Command/web/src/app/api/admin/auth/login/route.ts)
- [P] Endpoint to request a magic link (sends email via `EmailService`).

### [Dashboards & Reports]

#### [NEW] [/api/admin/camps/[id]/summary](file:///c:/Users/lloyd/Sync/Swedish%20Camp%20Command/web/src/app/api/admin/camps/%5Bid%5D/summary/route.ts)
- [P] Aggregate KPIs: Total Purchases, Completion %, Missing Count.

#### [NEW] [/api/admin/camps/[id]/attendance](file:///c:/Users/lloyd/Sync/Swedish%20Camp%20Command/web/src/app/api/admin/camps/%5Bid%5D/attendance/route.ts)
- [P] Join Purchases, Players, and Registrations.
- [P] Promotion of "Critical" flags (Medical, Allergy) based on form markers.

#### [NEW] [/api/admin/camps/[id]/export/[type]](file:///c:/Users/lloyd/Sync/Swedish%20Camp%20Command/web/src/app/api/admin/camps/%5Bid%5D/export/%5Btype%5D/route.ts)
- [P] **Strategy**: Server-side CSV streaming using `edge` runtime for performance.

#### [MODIFY] [admin/registrations/page.tsx](file:///c:/Users/lloyd/Sync/Swedish%20Camp%20Command/web/src/app/admin/registrations/page.tsx)
- [P] Master list with multi-status filtering.

## Task Breakdown

### Phase 1: Authentication & Foundational
- [ ] T1.1: Create `admin-auth.ts` logic for session management
- [ ] T1.2: Implement `POST /api/admin/auth/login` (magic link request)
- [ ] T1.3: Update `middleware.ts` to enforce admin sessions
- [ ] T1.4: Update `admin/layout.tsx` to handle unauthenticated states (redirect to login)

### Phase 2: Summary Dashboard & APIs
- [ ] T2.1: Implement `GET /api/admin/camps/[id]/summary` API
- [ ] T2.2: Implement `GET /api/admin/camps/[id]/attendance` with status markers
- [ ] T2.3: Build Summary Dashboard UI (KPI Cards)

### Phase 3: Reporting & Attendance UI
- [ ] T3.1: Build Attendance List UI with "Critical Info" flags and Collapsed Full Response
- [ ] T3.2: Implement Server-side CSV Streaming for all reports
- [ ] T3.3: Implement Unified Registrations View with filtering

## Verification Plan

### Automated Tests
- [ ] Security scans for admin routes
- [ ] API contract verification for CSV export
- [ ] Speed test (SC-001: Under 30s navigation)

### Manual Verification
- [ ] Request magic link and verify login
- [ ] Verify CSV opens correctly in Excel/Sheets
- [ ] Audit WCAG AA contrast on new dashboard components
