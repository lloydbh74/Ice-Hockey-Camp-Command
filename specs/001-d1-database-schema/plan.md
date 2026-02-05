# Implementation Plan: D1 Database Schema

**Branch**: `001-d1-database-schema` | **Date**: 2026-02-03 | **Spec**: /specs/001-d1-database-schema/spec.md
**Input**: Feature specification from `/specs/001-d1-database-schema/spec.md`

## Summary

This feature defines the foundational D1 database schema for the Swedish Camp Command application, refined from an initial CSV inference. The schema is designed to support multiple camps, manage player registrations, track product orders, and facilitate reminder systems, aligning with the project's core architectural principles for a scalable and robust data foundation.

## Technical Context

**Language/Version**: SQL (D1 SQLite dialect), TypeScript (for interactions)
**Primary Dependencies**: Cloudflare D1
**Storage**: Cloudflare D1
**Testing**: TDD principles apply; specifically, schema deployment and data seeding for validation.
**Target Platform**: Cloudflare D1 (database), Cloudflare Workers (for database interaction logic)
**Project Type**: Database Schema (component of Web Application)
**Performance Goals**: Read queries < 1ms, Write queries several ms (typical for D1). Overall API call latencies 200ms-500ms+ possible. Throughput ~1000 QPS (1ms query) / ~10 QPS (100ms query) per database. Read replication for global latency reduction.
**Constraints**: D1 database size limit 10GB per database (paid), 500MB (free). Single-threaded processing. Max row/string/BLOB size 2MB. No native ACID transactions, requiring careful design for data consistency in complex workflows.
**Scale/Scope**: Designed to support multiple camps, player registrations, product orders, and reminder systems. Scalability relies on sharding for >10GB data per logical entity. Quantitative targets (e.g., number of camps, peak registrations, total player records, product orders, reminder emails per day) NEEDS FURTHER REFINEMENT FROM PRODUCT/BUSINESS.

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
│   ├── models/           # Typescript models derived from schema
│   ├── services/         # Business logic interacting with D1
│   ├── api/              # API handlers (Hono)
│   └── db/               # SQL schema definitions, migrations, D1 access
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

**Structure Decision**: The project will follow a standard web application structure, separating frontend and backend concerns. The backend will include a dedicated `db/` directory for D1 database schema and related scripts.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
