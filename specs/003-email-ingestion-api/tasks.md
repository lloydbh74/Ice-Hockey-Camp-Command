---

description: "Task list for Email Ingestion API feature implementation"
---

# Tasks: Email Ingestion API

**Input**: Design documents from `/specs/002-email-ingestion-api/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The feature specification implicitly requests testing via "Independent Test" and "Acceptance Scenarios."

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description with file path`

-   **[P]**: Can run in parallel (different files, no dependencies)
-   **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
-   Include exact file paths in descriptions

## Path Conventions

-   **Web app**: `backend/src/`, `frontend/src/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

-   [ ] T001 Create backend/src/api/ingest directory for the API endpoint
-   [ ] T002 Create backend/src/services/ingest.ts for business logic
-   [ ] T003 Initialize backend/src as a TypeScript project (npm init -y, tsconfig.json) in backend/src/ (if not already done by a previous feature)
-   [ ] T004 Install core backend dependencies (e.g., Hono, @cloudflare/d1, @cloudflare/workers-types) in backend/src/ (if not already done)
-   [ ] T005 [P] Configure ESLint and Prettier for TypeScript in backend/src/ (if not already done)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

-   [ ] T006 Configure Wrangler for Worker deployment and D1 binding in wrangler.toml
-   [ ] T007 Implement a robust error handling middleware for the Hono API in backend/src/api/error_handler.ts
-   [ ] T008 Implement an authentication middleware for Bearer token validation in backend/src/api/auth_middleware.ts
-   [ ] T009 Create D1 database access utility or repository for Guardian and Purchase entities in backend/src/db/repositories.ts (building on 001-d1-database-schema)
-   [ ] T010 Create shared TypeScript interfaces/types for D1 entities (Guardian, Purchase, Product, Camp) based on 001-d1-database-schema in backend/src/models/d1_models.ts (if not already done)
-   [ ] T011 Define TypeScript interface for PurchaseIngestionRequest payload in backend/src/models/api_models.ts
-   [ ] T012 Design detailed error response format for API (based on Acceptance Scenario 5) in backend/src/models/error_responses.ts
-   [ ] T013 Define logging strategy and reporting for critical errors (based on FR-008) in backend/src/services/logger.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Ingest Purchase Email (Priority: P1) 🎯 MVP

**Goal**: As the system, I need to accept normalised purchase data from an upstream service (n8n) so that each camp order email becomes a structured `Purchase` record in the database with a clear `registration_state` and camp association.

**Independent Test**: This feature can be tested by sending POST requests with various payloads to the API endpoint and verifying the state of the database and the API's response.

### Tests for User Story 1

-   [ ] T014 [US1] Create unit tests for Purchase ingestion service logic in backend/tests/services/ingest.test.ts
-   [ ] T015 [US1] Create integration tests for `POST /api/email-ingest/purchase` endpoint for valid new purchase (SC-001) in backend/tests/api/ingest.test.ts
-   [ ] T016 [US1] Create integration tests for idempotency (SC-002) in backend/tests/api/ingest.test.ts
-   [ ] T017 [US1] Create integration tests for unauthorized access (SC-003) in backend/tests/api/ingest.test.ts
-   [ ] T018 [US1] Create integration tests for unknown product mapping (SC-004) in backend/tests/api/ingest.test.ts
-   [ ] T019 [US1] Create integration tests for malformed request body (Acceptance Scenario 5) and error response format in backend/tests/api/ingest.test.ts

### Implementation for User Story 1

-   [ ] T020 [US1] Implement `POST /api/email-ingest/purchase` endpoint using Hono in backend/src/api/ingest/index.ts
-   [ ] T021 [US1] Implement input validation for `PurchaseIngestionRequest` payload (using defined error format) in backend/src/api/ingest/validation.ts
-   [ ] T022 [US1] Implement idempotency check using `rawEmailId` in backend/src/services/ingest.ts
-   [ ] T023 [US1] Implement Guardian lookup/creation logic in backend/src/services/ingest.ts
-   [ ] T024 [US1] Implement Product/Camp mapping logic from `rawDescription` (using SKU) in backend/src/services/ingest.ts
-   [ ] T025 [US1] Implement `Purchase` record creation with `registration_state='uninvited'` in backend/src/services/ingest.ts
-   [ ] T026 [US1] Implement logging for product mapping errors (FR-008, using defined critical error logging) in backend/src/services/ingest.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

-   [ ] T027 Code cleanup and refactoring across backend/src/
-   [ ] T028 Update quickstart.md with deployment and interaction instructions
-   [ ] T029 Review API for adherence to performance goals (latency, throughput) and D1 constraints (idempotency, transactions, limits)
-   [ ] T030 Document n8n integration considerations and best practices in backend/docs/n8n_integration.md
-   [ ] T031 Plan for monitoring and alerting for ingestion errors and performance (including FR-008 reporting).
-   [ ] T032 Conduct load testing or performance profiling to validate API throughput and latency targets.
-   [ ] T033 Develop a strategy for handling D1 database size limits (sharding, archiving) and document in backend/docs/d1_scalability_plan.md
-   [ ] T034 Refine `backend/docs/d1_transaction_strategy.md` to reflect specific application-level design choices for data consistency despite D1's transactional limitations.

---

## Dependencies & Execution Order

### Phase Dependencies

-   **Setup (Phase 1)**: No dependencies - can start immediately
-   **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
-   **User Stories (Phase 3+)**: All depend on Foundational phase completion
    -   User stories can then proceed in parallel (if staffed)
    -   Or sequentially in priority order (P1 → P2 → P3)
-   **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

-   **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within Each User Story

-   Tests (if included) MUST be written and FAIL before implementation
-   Model interfaces before database access functions.
-   Core implementation before integration
-   Story complete before moving to next priority

### Parallel Opportunities

-   All Setup tasks marked [P] can run in parallel
-   Once Foundational phase completes, User Story 1 implementation tasks marked [P] can run in parallel
-   Tests within User Story 1 marked [P] can run in parallel
-   Model interfaces within User Story 1 marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Create unit tests for Purchase ingestion service logic in backend/tests/services/ingest.test.ts"
Task: "Create integration tests for `POST /api/email-ingest/purchase` endpoint for valid new purchase (SC-001) in backend/tests/api/ingest.test.ts"
Task: "Create integration tests for idempotency (SC-002) in backend/tests/api/ingest.test.ts"
Task: "Create integration tests for unauthorized access (SC-003) in backend/tests/api/ingest.test.ts"
Task: "Create integration tests for unknown product mapping (SC-004) in backend/tests/api/ingest.test.ts"
Task: "Create integration tests for malformed request body (Acceptance Scenario 5) and error response format in backend/tests/api/ingest.test.ts"

# Launch parallel implementation tasks:
Task: "Implement `POST /api/email-ingest/purchase` endpoint using Hono in backend/src/api/ingest/index.ts"
Task: "Implement input validation for `PurchaseIngestionRequest` payload (using defined error format) in backend/src/api/ingest/validation.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1.  Complete Phase 1: Setup
2.  Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3.  Complete Phase 3: User Story 1
4.  **STOP and VALIDATE**: Test User Story 1 independently
5.  Deploy/demo if ready

### Incremental Delivery

1.  Complete Setup + Foundational → Foundation ready
2.  Add User Story 1 → Test independently → Deploy/Demo (MVP!)

### Parallel Team Strategy

With multiple developers:

1.  Team completes Setup + Foundational together
2.  Once Foundational is done:
    -   Developer A: User Story 1

---

## Notes

-   [P] tasks = different files, no dependencies
-   [Story] label maps task to specific user story for traceability
-   Each user story should be independently completable and testable
-   Verify tests fail before implementing
-   Commit after each task or logical group
-   Stop at any checkpoint to validate story independently
-   Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence