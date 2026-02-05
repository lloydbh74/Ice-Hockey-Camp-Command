# Implementation Plan: Registration Flow and Reminder Engine

**Branch**: `003-registration-and-reminders` | **Date**: 2026-02-03 | **Spec**: /specs/003-registration-and-reminders/spec.md
**Input**: Feature specification from `/specs/003-registration-and-reminders/spec.md`

## Summary

This feature implements the complete guardian-facing registration flow and an automated reminder engine. It includes a secure magic-link driven frontend registration page for players, backend APIs to manage player details and kit orders, and a scheduled worker to send configurable reminder emails based on the `Purchase.registration_state`. It also introduces a `CampSettings` table to store reminder configurations.

## Technical Context

**Language/Version**: TypeScript (Frontend & Backend)
**Primary Dependencies**: React/Next.js (Frontend), Hono (Backend API), Cloudflare D1 (Database), Resend/Brevo (Transactional Email), Supabase Auth (or similar for Magic Link generation/validation)
**Storage**: Cloudflare D1
**Testing**: TDD principles apply; specifically, unit, integration, and end-to-end tests for UI, API endpoints, and scheduled Workers.
**Target Platform**: Cloudflare Pages (Frontend), Cloudflare Workers (Backend API, Scheduled Worker)
**Project Type**: Full-stack Web Application (Frontend + Backend API + Scheduled Worker)
**Performance Goals**: Frontend responsiveness: Page load times optimized with React/Next.js/Cloudflare Pages (SSR/SSG/ISR), image optimization, code splitting, caching. API latency: Backend Hono/Workers for low-latency responses. D1 cold start can add 250-800ms latency to first query. Transactional Email: High Deliverability Rate, Open Rate, CTR, and critical Time to Inbox. Specific metrics (e.g., <2s page load, <500ms API response, <5min Time to Inbox, <30s scheduled worker) NEEDS FURTHER DEFINITION.
**Constraints**: Magic Links: Cryptographically secure tokens (UUIDs/random bytes, short lifespan, unique per request), stored in Cloudflare KV (atomic update with 'used' flag for single-use). Configurable Reminders: Cadence/limits in D1 (`CampSettings`), processed by Scheduled Workers (Cron Triggers). Email Reliability: Robust error handling, logging, retry logic for transactional email services. D1 Constraints: Single-threaded writes (`batch`), 10GB/500MB DB size limits (consider sharding), region-specific D1 (latency if distant Worker), cold starts. Worker Limits: CPU (10ms Free/5min Paid), memory (128MB), 6 concurrent outgoing connections.
**Scale/Scope**: Concurrent Registrations: Cloudflare Workers handle high concurrency (millions req/sec network, thousands per Worker script). Scheduled Reminders: Cloudflare Scheduled Workers (Cron Triggers) for periodic processing. Email sending: 100K/day (Free), unlimited (Paid). Quantitative targets (e.g., peak concurrent registrations, reminder emails per hour/day, total active Purchases) NEEDS FURTHER REFINEMENT FROM PRODUCT/BUSINESS.

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

backend/
├── src/
│   ├── api/
│   │   ├── registration/   # Registration API endpoints
│   │   └── reminders/      # Reminder API (for triggering, if needed)
│   ├── workers/
│   │   └── reminder_scheduler.ts # Scheduled worker for reminders
│   ├── services/
│   │   ├── registration.ts # Business logic for registration
│   │   └── reminder.ts     # Business logic for reminders
│   ├── models/             # Shared data models/interfaces (D1 entities)
│   └── db/                 # D1 database interaction utilities (from previous feature)
└── tests/

frontend/
├── src/
│   ├── components/         # UI components
│   ├── pages/
│   │   └── registration/   # Registration page (magic link target)
│   └── services/           # Frontend API interaction
└── tests/

**Structure Decision**: The project will follow a standard web application structure, separating frontend and backend concerns. The backend will include dedicated directories for registration APIs, scheduled workers, business logic services, shared data models, and D1 database utilities. The frontend will have specific pages for the registration flow.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
