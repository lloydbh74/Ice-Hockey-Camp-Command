# Implementation Plan: Email Ingestion API

**Branch**: `002-email-ingestion-api` | **Date**: 2026-02-03 | **Spec**: /specs/002-email-ingestion-api/spec.md
**Input**: Feature specification from `/specs/002-email-ingestion-api/spec.md`

## Summary

This feature defines a backend API responsible for ingesting normalized purchase data, primarily derived from parsed email confirmations, into the Cloudflare D1 database. The API ensures idempotency and creates structured `Purchase` records with an 'uninvited' registration state, linking them to existing `Guardian`, `Product`, and `Camp` entities within the `001-d1-database-schema`.

## Technical Context

**Language/Version**: TypeScript
**Primary Dependencies**: Hono (for API routing), Cloudflare D1 (for database interaction), @cloudflare/workers-types
**Storage**: Cloudflare D1 (via 001-d1-database-schema)
**Testing**: TDD principles apply; specifically, unit and integration tests for API endpoints and database interactions.
**Target Platform**: Cloudflare Workers
**Project Type**: Backend API (component of Web Application)
**Performance Goals**: Latency: D1 requests via Workers API show up to 60% latency improvement. Throughput: D1 exhibits faster writes (6.8x to 11x faster) compared to older versions. Performance of idempotent APIs relies on efficient implementation (e.g., unique keys for lookup, batch operations) and D1 query performance. Specific metrics (e.g., target messages per second, latency targets) NEEDS FURTHER DEFINITION.
**Constraints**: Idempotency: `D1Database::batch` for transactional guarantees. Complex idempotent operations require application-level design. D1 Operational Limits: 10GB/500MB DB size limits per database, 6 concurrent connections per Worker invocation, standard Worker CPU/Memory limits apply. n8n Integration: Cloudflare Workers Request Body Size limits (e.g., 100MB/500MB), n8n workflow timeouts (30s), memory limits.
**Scale/Scope**: Emails per Day: 100,000 (Free) / Unlimited (Paid) per Worker. Concurrent Requests: Cloudflare network supports high volumes; individual Worker subrequests can handle 6 simultaneous outgoing connections. CPU Time: 10ms (Free) / 5min (Paid) per request. Message Size: Email Routing 25 MiB. Quantitative targets (e.g., average/peak emails per day, expected max concurrent requests) NEEDS FURTHER REFINEMENT FROM PRODUCT/BUSINESS.

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
│   │   └── ingest/         # Email ingestion API endpoint
│   ├── services/
│   │   └── ingest.ts       # Business logic for email ingestion
│   ├── models/             # Shared data models/interfaces
│   └── db/                 # D1 database interaction utilities (from previous feature)
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

**Structure Decision**: The project will follow a standard web application structure, separating frontend and backend concerns. The backend will include a dedicated `api/ingest` directory for the email ingestion API endpoint, with associated services and models. This builds upon the `db/` utilities from the `001-d1-database-schema` feature.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
