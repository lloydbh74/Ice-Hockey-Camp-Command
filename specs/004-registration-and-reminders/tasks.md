---

description: "Task list for Registration Flow and Reminder Engine feature implementation"
---

# Tasks: Registration Flow and Reminder Engine

**Input**: Design documents from `/specs/003-registration-and-reminders/`
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

-   [ ] T001 Create backend/src/api/registration/ directory for registration API endpoints
-   [ ] T002 Create backend/src/api/reminders/ directory for reminder API endpoints (if needed)
-   [ ] T003 Create backend/src/workers/reminder_scheduler.ts for the scheduled worker
-   [ ] T004 Create backend/src/services/registration.ts for registration business logic
-   [ ] T005 Create backend/src/services/reminder.ts for reminder business logic
-   [ ] T006 Create frontend/src/pages/registration/ directory for the registration page
-   [ ] T007 Initialize backend/src as a TypeScript project (npm init -y, tsconfig.json) in backend/src/ (if not already done by a previous feature)
-   [ ] T008 Initialize frontend/ as a React/Next.js project in frontend/ (if not already done)
-   [ ] T009 Install core backend dependencies (Hono, Cloudflare D1 client, email client) in backend/src/ (if not already done)
-   [ ] T010 Install core frontend dependencies (React, Next.js) in frontend/ (if not already done)
-   [ ] T011 [P] Configure ESLint and Prettier for TypeScript in backend/src/ (if not already done)
-   [ ] T012 [P] Configure ESLint and Prettier for React/TypeScript in frontend/ (if not already done)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

-   [ ] T013 Implement D1 database schema for CampSettings table in backend/src/db/migrations/003_add_camp_settings.ts
-   [ ] T014 Configure Wrangler for frontend (Pages) and backend (Workers) deployment in wrangler.toml
-   [ ] T015 Implement secure magic link generation utility in backend/src/services/magic_link_utils.ts
-   [ ] T016 Implement magic link validation and single-use enforcement using Cloudflare KV in backend/src/services/magic_link_utils.ts
-   [ ] T017 Implement transactional email sending utility using Resend/Brevo API in backend/src/services/email_sender.ts
-   [ ] T018 Create D1 database access utility or repository for CampSettings, Purchase, Reminder entities in backend/src/db/repositories.ts (building on 001-d1-database-schema)
-   [ ] T019 Define TypeScript interfaces for API request/response payloads (e.g., RegistrationSubmissionRequest, PlayerDetails, KitOrderDetails) in backend/src/models/api_models.ts
-   [ ] T020 Implement a robust error handling middleware for the Hono API in backend/src/api/error_handler.ts (if not already done)
-   [ ] T021 Implement an authentication middleware for Bearer token validation for internal APIs (e.g., /registration/invite) in backend/src/api/auth_middleware.ts (if not already done)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Guardian Registration via Magic Link (Priority: P1) 🎯 MVP

**Goal**: As a guardian, when I receive a "Complete your camp registration" email and click the unique link, I should land on a secure registration page pre-scoped to the correct Camp and Purchase, without needing a password, so that I can easily provide my child's details.

**Independent Test**: This can be tested by triggering the invite process for a purchase, capturing the sent email, clicking the link, and verifying the correct registration page is displayed.

### Tests for User Story 1

-   [ ] T022 [US1] Create unit tests for magic link generation and validation logic in backend/tests/services/magic_link_utils.test.ts
-   [ ] T023 [US1] Create integration tests for `POST /api/registration/invite` (FR-001) in backend/tests/api/registration.test.ts
-   [ ] T024 [US1] Create integration tests for `GET /registration/:token` (FR-002, Acceptance Scenarios 1, 2, 3) in frontend/tests/pages/registration.test.ts and backend/tests/api/registration.test.ts
-   [ ] T025 [US1] Create integration tests for `POST /api/registration/submit` (FR-003, Acceptance Scenario 4) in backend/tests/api/registration.test.ts
-   [ ] T026 [US1] Create end-to-end test for full magic link registration flow in e2e/registration_flow.test.ts

### Implementation for User Story 1

-   [ ] T027 [US1] Implement `POST /api/registration/invite` endpoint (FR-001) in backend/src/api/registration/invite.ts
-   [ ] T028 [US1] Implement backend logic for `GET /registration/:token` (FR-002) to validate token, update state, and prepare data for frontend in backend/src/api/registration/validate_token.ts
-   [ ] T029 [US1] Implement frontend registration page (`frontend/src/pages/registration/[token].tsx`) to display form, pre-fill data, and handle submission
-   [ ] T030 [US1] Implement `POST /api/registration/submit` endpoint (FR-003) to accept form data, create Player/Registration/KitOrders, and update Purchase state in backend/src/api/registration/submit.ts
-   [ ] T031 [US1] Implement validation for registration form data (PlayerDetails, KitOrderDetails) in backend/src/services/registration.ts
-   [ ] T032 [US1] Implement logic to create Player, Registration, and KitOrder records in backend/src/services/registration.ts
-   [ ] T033 [US1] Implement logic to update `Purchase.registration_state` to 'completed' in backend/src/services/registration.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Automated Registration Reminders (Priority: P2)

**Goal**: As the system, I must automatically send reminder emails to guardians who have not completed their registration, according to camp-specific settings, to maximize the registration completion rate.

**Independent Test**: This can be tested by creating `Purchase` records with old `purchase_timestamp` values, configuring reminder settings for their camp, running the scheduled worker, and verifying that new rows are created in the `Reminders` table and emails are sent.

### Tests for User Story 2

-   [ ] T034 [US2] Create unit tests for reminder eligibility logic in backend/tests/services/reminder.test.ts
-   [ ] T035 [US2] Create integration tests for scheduled reminder worker (FR-004, Acceptance Scenarios 1, 2, 3) in backend/tests/workers/reminder_scheduler.test.ts

### Implementation for User Story 2

-   [ ] T036 [US2] Implement scheduled worker (`backend/src/workers/reminder_scheduler.ts`) to periodically query for `Purchases` due for reminder (FR-004)
-   [ ] T037 [US2] Implement reminder eligibility logic based on `registration_state`, `CampSettings`, and `Reminders` history (FR-005) in backend/src/services/reminder.ts
-   [ ] T038 [US2] Implement logic to generate new `Reminder` tokens and send emails (reusing magic link and email sender utilities) in backend/src/services/reminder.ts
-   [ ] T039 [US2] Implement logic to update `Purchase.registration_state` to 'invited' if a new reminder is sent (FR-001 implicitly)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

-   [ ] T040 Code cleanup and refactoring across backend/src/, frontend/src/
-   [ ] T041 Update quickstart.md with full deployment and interaction instructions for both registration and reminders.
-   [ ] T042 Review API for adherence to performance goals (latency, throughput) and D1 constraints (cold starts, transactional limits)
-   [ ] T043 Review magic link security implementation (token entropy, KV update atomic guarantees, rate limiting)
-   [ ] T044 Implement robust logging and monitoring for registration and reminder events (including email sending failures).
-   [ ] T045 Plan for scalability strategies (e.g., sharding if CampSettings/Reminders grow large) based on defined NFRs.
-   [ ] T046 Refine NFR quantitative metrics for Performance Goals, Constraints, and Scale/Scope based on research.md and business input.
-   [ ] T047 Address edge cases: old reminder links after newer ones, email sending service failures.

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
-   **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable

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
Task: "Create unit tests for magic link generation and validation logic in backend/tests/services/magic_link_utils.test.ts"
Task: "Create integration tests for `POST /api/registration/invite` (FR-001) in backend/tests/api/registration.test.ts"
Task: "Create integration tests for `GET /registration/:token` (FR-002, Acceptance Scenarios 1, 2, 3) in frontend/tests/pages/registration.test.ts and backend/tests/api/registration.test.ts"
Task: "Create integration tests for `POST /api/registration/submit` (FR-003, Acceptance Scenario 4) in backend/tests/api/registration.test.ts"
Task: "Create end-to-end test for full magic link registration flow in e2e/registration_flow.test.ts"

# Launch parallel implementation tasks:
Task: "Implement `POST /api/registration/invite` endpoint (FR-001) in backend/src/api/registration/invite.ts"
Task: "Implement backend logic for `GET /registration/:token` (FR-002) to validate token, update state, and prepare data for frontend in backend/src/api/registration/validate_token.ts"
Task: "Implement frontend registration page (`frontend/src/pages/registration/[token].tsx`) to display form, pre-fill data, and handle submission"
Task: "Implement `POST /api/registration/submit` endpoint (FR-003) to accept form data, create Player/Registration/KitOrders, and update Purchase state in backend/src/api/registration/submit.ts"
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
3.  Add User Story 2 → Test independently → Deploy/Demo

### Parallel Team Strategy

With multiple developers:

1.  Team completes Setup + Foundational together
2.  Once Foundational is done:
    -   Developer A: User Story 1
    -   Developer B: User Story 2

---

## Notes

-   [P] tasks = different files, no dependencies
-   [Story] label maps task to specific user story for traceability
-   Each user story should be independently completable and testable
-   Verify tests fail before implementing
-   Commit after each task or logical group
-   Stop at any checkpoint to validate story independently
-   Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
