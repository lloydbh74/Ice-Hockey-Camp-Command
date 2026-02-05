# Implementation Plan: Camp Day Planner

**Branch**: `006-camp-day-planner` | **Date**: 2026-02-04 | **Spec**: [specs/006-camp-day-planner/spec.md](specs/006-camp-day-planner/spec.md)
**Input**: Feature specification from `/specs/006-camp-day-planner/spec.md`

## Summary

The primary requirement is to provide a drag-and-drop planner for daily camp schedules, allowing organisers to define days, schedule sessions, assign streams, and visually adjust the schedule. It also includes a read-only coach view. The technical approach will leverage the existing Cloudflare stack (React/Next.js for frontend, Hono/Cloudflare Workers for backend, Cloudflare D1 for database) and align with the "Organiser-First Admin Experience" principle.

## Technical Context

**Language/Version**: TypeScript (Frontend & Backend), React/Next.js (Frontend), Hono (Backend)
**Primary Dependencies**: React, Next.js, Hono, Cloudflare D1
**Storage**: Cloudflare D1 (for relational data). Requires schema modifications for `CampDays`, `Streams`, `Sessions`, `SessionStreams` tables (FR-001).
**Testing**: Test-Driven Development (TDD) as per Constitution; Vitest for unit/component (frontend) and unit/integration (backend) testing; Playwright for end-to-end (frontend) testing.
**Target Platform**: Cloudflare Pages (Frontend), Cloudflare Workers (Backend)
**Project Type**: Web application (Frontend + Backend)
**Performance Goals**:
- An organiser can fully schedule a 3-day camp with 5 sessions per day across 2 streams in under 30 minutes using the UI (SC-001).
- A coach can access their filtered, read-only daily schedule by opening a single URL, with the page loading in under 3 seconds on a mobile device (SC-002).
**Constraints**:
- The admin UI MUST provide a drag-and-drop interface for managing sessions on a timeline (FR-003).
- The UI MUST prevent or visually flag scheduling overlaps for sessions within the same `Stream` (FR-005).
- Deleting `Camp` with scheduled `CampDays`/`Sessions` or `Stream` with assigned `Sessions` should be prevented; use "soft delete" or "archive" functionality (Edge Cases).
**Scale/Scope**: Managing schedules for multiple camp days, sessions, and streams. This feature deals with complex UI interactions and data integrity for scheduling.

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
│   ├── api/ # Hono routes and handlers for admin API endpoints (camp days, sessions, streams)
│   └── services/ # Logic for data retrieval and processing (CampDayService, StreamService, SessionService)
└── tests/ # Backend unit and integration tests (Vitest)

frontend/
├── src/
│   ├── components/ # Reusable UI components (scheduler, timeline, forms)
│   ├── pages/ # Next.js pages for admin scheduler and coach view
│   └── services/ # Frontend services for API interaction (CampDayApi, StreamApi, SessionApi)
└── tests/ # Frontend unit and E2E tests (Vitest, Playwright)
```

**Structure Decision**: The project will adopt a `backend/` and `frontend/` structure. The `backend/` will host the Cloudflare Worker with Hono routing and D1 interaction logic. The `frontend/` will contain the Next.js application, including React components, pages, and API interaction services. This aligns with the "Web application (frontend + backend)" model specified in the technical context.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
