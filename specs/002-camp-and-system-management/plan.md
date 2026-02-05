# Implementation Plan: Camp and Settings Management

**Branch**: `005-camp-and-settings-management` | **Date**: 2026-02-04 | **Spec**: [specs/005-camp-and-settings-management/spec.md](specs/005-camp-and-settings-management/spec.md)
**Input**: Feature specification from `/specs/005-camp-and-settings-management/spec.md`

## Summary

The primary requirement is to provide an admin UI at `/admin/settings` for managing camps, products, and reminder settings. The technical approach will leverage the existing Cloudflare stack (React/Next.js for frontend, Hono/Cloudflare Workers for backend, Cloudflare D1 for database) and prioritize organiser's ability to configure camp and product settings, aligned with the "Organiser-First Admin Experience" constitution principle.

## Technical Context

**Language/Version**: TypeScript (Frontend & Backend), React/Next.js (Frontend), Hono (Backend)
**Primary Dependencies**: React, Next.js, Hono, Cloudflare D1
**Storage**: Cloudflare D1 (for relational data).
**Testing**: Test-Driven Development (TDD) as per Constitution; Vitest for unit/component (frontend) and unit/integration (backend) testing; Playwright for end-to-end (frontend) testing.
**Target Platform**: Cloudflare Pages (Frontend), Cloudflare Workers (Backend)
**Project Type**: Web application (Frontend + Backend)
**Performance Goals**: An organiser can successfully create a new `Camp`, associate a `Product` with it, and configure its reminder settings, all through the admin UI, in under 5 minutes.
**Constraints**:
- When a `Product` or `CampProduct` is edited, the changes MUST NOT retroactively alter historical `Purchase` records (FR-007).
- Deleting `Product` or `Camp` with `Purchase` records should be prevented with a warning, suggesting "soft delete" or "archive" functionality (Edge Cases).
- All forms in the settings UI MUST provide clear feedback on success or failure (SC-004).
**Scale/Scope**: Multiple camps, multiple products, managing reminder settings per camp. This feature primarily deals with CRUD operations for configuration entities rather than high-volume transaction processing.

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
│   ├── api/ # Hono routes and handlers for admin API endpoints (camps, products, camp-products, settings)
│   └── services/ # Logic for data retrieval and processing (CampService, ProductService, CampProductService, CampSettingsService)
└── tests/ # Backend unit and integration tests (Vitest)

frontend/
├── src/
│   ├── components/ # Reusable UI components (forms for camps, products, settings)
│   ├── pages/ # Next.js pages for admin settings (camps, products, reminders)
│   └── services/ # Frontend services for API interaction (CampApi, ProductApi, CampProductApi, CampSettingsApi)
└── tests/ # Frontend unit and E2E tests (Vitest, Playwright)
```

**Structure Decision**: The project will adopt a `backend/` and `frontend/` structure. The `backend/` will host the Cloudflare Worker with Hono routing and D1 interaction logic. The `frontend/` will contain the Next.js application, including React components, pages, and API interaction services. This aligns with the "Web application (frontend + backend)" model specified in the technical context.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
