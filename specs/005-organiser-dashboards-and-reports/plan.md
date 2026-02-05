# Implementation Plan: Organiser Dashboards and Reports

**Branch**: `004-organiser-dashboards-and-reports` | **Date**: 2026-02-04 | **Spec**: [specs/004-organiser-dashboards-and-reports/spec.md](specs/004-organiser-dashboards-and-reports/spec.md)
**Input**: Feature specification from `/specs/004-organiser-dashboards-and-reports/spec.md`

## Summary

The primary requirement is to provide organiser-facing web UI and backend endpoints for viewing camp summaries, daily attendance, kit orders, and missing registrations. The technical approach will leverage the existing Cloudflare stack (React/Next.js for frontend, Hono/Cloudflare Workers for backend, Cloudflare D1 for database) and prioritize organiser efficiency with reliable CSV exports, aligned with the "Organiser-First Admin Experience" constitution principle.

## Technical Context

**Language/Version**: TypeScript (Frontend & Backend), React/Next.js (Frontend), Hono (Backend)
**Primary Dependencies**: React, Next.js, Hono, Cloudflare D1
**Storage**: Cloudflare D1 (for relational data); CSV exports will be streamed directly to the client.
**Testing**: Test-Driven Development (TDD) as per Constitution; Vitest for unit/component (frontend) and unit/integration (backend) testing; Playwright for end-to-end (frontend) testing.
**Target Platform**: Cloudflare Pages (Frontend), Cloudflare Workers (Backend)
**Project Type**: Web application (Frontend + Backend)
**Performance Goals**: An authenticated organiser can navigate from the main dashboard to any of the three sub-reports in under 30 seconds.
**Constraints**:
- All data displayed in the UI views MUST exactly match the data exported in the corresponding CSV files.
- CSV files MUST download successfully and open without errors in standard spreadsheet software.
- Unauthenticated users attempting to access any `/api/admin/*` endpoint MUST receive a `401 Unauthorized` or `403 Forbidden` response in 100% of cases.
- Authentication via magic-link system with authorized organiser emails in environment variable.
**Scale/Scope**: Multiple camps, multiple organisers, handling player registrations and kit orders. The feature primarily deals with data presentation and reporting for organizers rather than high-volume transaction processing.

## Constitution Check

*GATE: Must pass before research and implementation. All checks must be re-verified if the design changes.*

- [x] **I. Email-First Ingestion**: Does this feature correctly handle inputs originating from email parsing?
- [x] **II. Camp-Scoped Data Model**: Is all new data correctly and explicitly associated with a `Camp`?
- [x] **III. Explicit Registration Status**: Does the feature respect and correctly update the `registration_state`?
- [x] **IV. Reminder-Driven UX**: Does this feature align with the magic-link, no-login user experience?
- [x] **V. Organiser-First Admin Experience**: Does this feature provide simple, actionable views and reliable exports for organizers?
- [x] **VI. Full-Stack Cloudflare & TDD**: Is the feature implemented on the Cloudflare stack and developed with TDD?

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/ # Hono routes and handlers for admin API endpoints
│   └── services/ # Logic for data retrieval and processing
└── tests/ # Backend unit and integration tests (Vitest)

frontend/
├── src/
│   ├── components/ # Reusable UI components
│   ├── pages/ # Next.js pages for admin dashboards
│   └── services/ # Frontend services for API interaction
└── tests/ # Frontend unit and E2E tests (Vitest, Playwright)
```

**Structure Decision**: The project will adopt a `backend/` and `frontend/` structure. The `backend/` will host the Cloudflare Worker with Hono routing and D1 interaction logic. The `frontend/` will contain the Next.js application, including React components, pages, and API interaction services. This aligns with the "Web application (frontend + backend)" model specified in the technical context.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
