---

description: "Generate an actionable, dependency-ordered tasks.md for the feature based on available design artifacts."
---

# Tasks: Camp Day Planner

**Input**: Design documents from `/specs/006-camp-day-planner/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: This plan includes test tasks as the plan.md indicates a TDD approach.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`

## Phase 1: Setup (Project Initialization)

**Purpose**: Project initialization and basic structure for frontend and backend.

- [ ] T001 Create project directory structure for backend and frontend (`backend/`, `frontend/`).
- [ ] T002 Initialize backend Cloudflare Worker project with Hono and TypeScript (`backend/`).
- [ ] T003 Configure backend TypeScript for Hono and Cloudflare D1 (`backend/tsconfig.json`).
- [ ] T004 Initialize frontend Next.js project with React and TypeScript (`frontend/`).
- [ ] T005 Configure frontend TypeScript for React and Next.js (`frontend/tsconfig.json`).
- [ ] T006 Setup shared linting and formatting configuration for backend and frontend (`.eslintrc.js`, `prettierrc.js`).
- [ ] T007 Configure backend Vitest for unit/integration tests (`backend/vitest.config.ts`).
- [ ] T008 Configure frontend Vitest for unit/component tests (`frontend/vitest.config.ts`).
- [ ] T009 Configure Playwright for frontend E2E tests (`frontend/playwright.config.ts`).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented, including authentication, database schema modifications, and common database access.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T010 Ensure authentication middleware is configured for new admin schedule routes (`backend/src/api/middleware/auth.ts`).
- [ ] T011 Setup D1 database connection utility and ensure compatibility with new entities (`backend/src/services/db.ts`).
- [ ] T012 Implement database schema migration for `CampDays`, `Streams`, `Sessions`, `SessionStreams` tables (`backend/src/db/migrations/00x_create_schedule_tables.sql`).
- [ ] T013 Implement generic data access layer (DAL) for CRUD operations on new entities (`backend/src/services/dataAccess.ts`).
- [ ] T014 Implement basic shared utility functions (e.g., error handling, logging) in backend (`backend/src/services/utils.ts`).
- [ ] T015 Implement basic shared utility functions (e.g., API client, error handling) in frontend (`frontend/src/services/utils.ts`).

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Define Camp Days (Priority: P1) 🎯 MVP

**Goal**: As an organiser, I want to define the individual days of a `Camp` (e.g., Friday–Sunday) so I can create a schedule of activities for each day.

**Independent Test**: An authenticated organiser can view the schedule planner for a `Camp`, add a new day with a date and a label, and verify that the new day appears in the UI and is persisted in the database.

### Tests for User Story 1

- [ ] T016 [P] [US1] Unit test `CampDayService` (CRUD operations) (`backend/tests/services/CampDayService.test.ts`).
- [ ] T017 [P] [US1] Integration test for `CampDay` API routes (`backend/tests/api/CampDayRoutes.test.ts`).
- [ ] T018 [P] [US1] Component test for `CampDayForm` (`frontend/tests/components/CampDayForm.test.tsx`).
- [ ] T019 [P] [US1] Component test for `CampDayList` (`frontend/tests/components/CampDayList.test.tsx`).

### Implementation for User Story 1

- [ ] T020 [P] [US1] Backend: Implement `CampDayService` for CRUD operations on `CampDays` (`backend/src/services/CampDayService.ts`).
- [ ] T021 [P] [US1] Backend: Create API routes for `CampDays` (list, create, update, delete) (`backend/src/api/campDays.ts`).
- [ ] T022 [P] [US1] Frontend: Create API clients for `CampDay` CRUD (`frontend/src/services/CampDayApi.ts`).
- [ ] T023 [P] [US1] Frontend: Create `CampDayForm` component (`frontend/src/components/CampDayForm.tsx`).
- [ ] T024 [P] [US1] Frontend: Create `CampDayList` component (`frontend/src/components/CampDayList.tsx`).
- [ ] T025 [US1] Frontend: Create Admin Schedule Planner page to display `CampDayList` and `CampDayForm` (`frontend/src/pages/admin/camps/[campId]/schedule.tsx`).
- [ ] T026 [US1] E2E Test: Organiser adds a new Camp Day and verifies its persistence and display (`frontend/tests/e2e/us1.spec.ts`).

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Schedule Sessions (Priority: P2)

**Goal**: As an organiser, I want to create named `Sessions` on each day with start/end times and assign them to one or more `Streams`, so I can build out the detailed camp schedule.

**Independent Test**: An authenticated organiser can create a new `Stream`, create a new `Session` for a `CampDay` with start/end times and location, assign it to the created `Stream`, and verify its display on the visual timeline and persistence in the database.

### Tests for User Story 2

- [ ] T027 [P] [US2] Unit test `StreamService` (CRUD operations) (`backend/tests/services/StreamService.test.ts`).
- [ ] T028 [P] [US2] Unit test `SessionService` (CRUD operations) (`backend/tests/services/SessionService.test.ts`).
- [ ] T029 [P] [US2] Unit test `SessionStreamService` (assignment operations) (`backend/tests/services/SessionStreamService.test.ts`).
- [ ] T030 [P] [US2] Integration test for `Stream` API routes (`backend/tests/api/StreamRoutes.test.ts`).
- [ ] T031 [P] [US2] Integration test for `Session` API routes (`backend/tests/api/SessionRoutes.test.ts`).
- [ ] T032 [P] [US2] Integration test for `SessionStream` API routes (`backend/tests/api/SessionStreamRoutes.test.ts`).
- [ ] T033 [P] [US2] Component test for `StreamForm` (`frontend/tests/components/StreamForm.test.tsx`).
- [ ] T034 [P] [US2] Component test for `SessionForm` (`frontend/tests/components/SessionForm.test.tsx`).
- [ ] T035 [P] [US2] Component test for `SessionStreamAssignment` (`frontend/tests/components/SessionStreamAssignment.test.tsx`).

### Implementation for User Story 2

- [ ] T036 [P] [US2] Backend: Implement `StreamService` for CRUD operations on `Streams` (`backend/src/services/StreamService.ts`).
- [ ] T037 [P] [US2] Backend: Implement `SessionService` for CRUD operations on `Sessions` (`backend/src/services/SessionService.ts`).
- [ ] T038 [P] [US2] Backend: Implement `SessionStreamService` for assigning/unassigning `Streams` to `Sessions` (`backend/src/services/SessionStreamService.ts`).
- [ ] T039 [P] [US2] Backend: Create API routes for `Streams` (list, create, update, delete) (`backend/src/api/streams.ts`).
- [ ] T040 [P] [US2] Backend: Create API routes for `Sessions` (list, create) (`backend/src/api/sessions.ts`).
- [ ] T041 [P] [US2] Backend: Create API routes for `SessionStreams` (assign, unassign) (`backend/src/api/sessionStreams.ts`).
- [ ] T042 [P] [US2] Frontend: Create API clients for `Stream` CRUD (`frontend/src/services/StreamApi.ts`).
- [ ] T043 [P] [US2] Frontend: Create API clients for `Session` CRUD (`frontend/src/services/SessionApi.ts`).
- [ ] T044 [P] [US2] Frontend: Create API clients for `SessionStream` operations (`frontend/src/services/SessionStreamApi.ts`).
- [ ] T045 [P] [US2] Frontend: Create `StreamForm` component (`frontend/src/components/StreamForm.tsx`).
- [ ] T046 [P] [US2] Frontend: Create `SessionForm` component (`frontend/src/components/SessionForm.tsx`).
- [ ] T047 [P] [US2] Frontend: Integrate Stream and Session forms into Admin Schedule Planner page (`frontend/src/pages/admin/camps/[campId]/schedule.tsx`).
- [ ] T048 [US2] E2E Test: Organiser creates a Stream, creates a Session for a CampDay, assigns it to the Stream, and verifies display/persistence (`frontend/tests/e2e/us2.spec.ts`).

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - Visually Adjust Schedule (Priority: P3)

**Goal**: As an organiser, I want to drag and drop `Sessions` on a visual timeline to adjust the schedule quickly, so I can easily resolve conflicts or make changes.

**Independent Test**: An authenticated organiser can drag a `Session` on the timeline to a new valid time slot, verify its `start_time` and `end_time` are updated in the database, and observe the UI preventing or flagging conflicts if an invalid drop is attempted.

### Tests for User Story 3

- [ ] T049 [P] [US3] Unit test `SessionService` for time update logic and conflict detection (`backend/tests/services/SessionService.test.ts`).
- [ ] T050 [P] [US3] Integration test for `PUT /admin/sessions/:sessionId` for time updates and conflict response (`backend/tests/api/SessionRoutes.test.ts`).
- [ ] T051 [P] [US3] Component test for `SessionTimelineItem` (draggable) (`frontend/tests/components/SessionTimelineItem.test.tsx`).
- [ ] T052 [P] [US3] Component test for `SessionScheduler` (drag-and-drop logic, conflict display) (`frontend/tests/components/SessionScheduler.test.tsx`).

### Implementation for User Story 3

- [ ] T053 [P] [US3] Backend: Implement `updateSession` logic in `SessionService` to handle time updates and check for scheduling overlaps (`backend/src/services/SessionService.ts`).
- [ ] T054 [P] [US3] Backend: Update API route `PUT /admin/sessions/:sessionId` to use `updateSession` logic (`backend/src/api/sessions.ts`).
- [ ] T055 [P] [US3] Frontend: Create `SessionTimelineItem` component with draggable functionality (`frontend/src/components/SessionTimelineItem.tsx`).
- [ ] T056 [P] [US3] Frontend: Create `SessionScheduler` component to manage visual timeline, drag-and-drop interactions, and conflict display (`frontend/src/components/SessionScheduler.tsx`).
- [ ] T057 [US3] Frontend: Integrate `SessionScheduler` into Admin Schedule Planner page (`frontend/src/pages/admin/camps/[campId]/schedule.tsx`).
- [ ] T058 [US3] E2E Test: Organiser drags a Session to a new time, verifies update, and tests conflict flagging/prevention (`frontend/tests/e2e/us3.spec.ts`).

**Checkpoint**: All user stories implemented so far should now be independently functional.

---

### User Story 4 - Read-Only Coach View (Priority: P4)

**Goal**: As a coach, I want a simple, read-only view of my assigned day's schedule, filtered by my `Stream`, so I can see where I need to be and when, directly from my phone.

**Independent Test**: A coach can access a valid public URL for a specific camp day and stream, and then see a read-only list or timeline of only the sessions relevant to that day and stream, loading under 3 seconds on a mobile device.

### Tests for User Story 4

- [ ] T059 [P] [US4] Unit test `CoachScheduleService` for filtering logic (`backend/tests/services/CoachScheduleService.test.ts`).
- [ ] T060 [P] [US4] Integration test for `GET /coach/camps/:campId/day/:dayId` public API route (`backend/tests/api/CoachRoutes.test.ts`).
- [ ] T061 [P] [US4] Component test for `CoachScheduleView` (`frontend/tests/components/CoachScheduleView.test.tsx`).

### Implementation for User Story 4

- [ ] T062 [P] [US4] Backend: Implement `CoachScheduleService` to fetch and filter sessions for coach view (`backend/src/services/CoachScheduleService.ts`).
- [ ] T063 [P] [US4] Backend: Create public, read-only API route `GET /coach/camps/:campId/day/:dayId` (`backend/src/api/coach.ts`).
- [ ] T064 [P] [US4] Frontend: Create API clients for coach view (`frontend/src/services/CoachApi.ts`).
- [ ] T065 [P] [US4] Frontend: Create `CoachScheduleView` component (`frontend/src/components/CoachScheduleView.tsx`).
- [ ] T066 [US4] Frontend: Create Coach View page (`frontend/src/pages/coach/camps/[campId]/day/[dayId].tsx`).
- [ ] T067 [US4] E2E Test: Coach accesses public URL, verifies filtered read-only schedule and mobile loading performance (`frontend/tests/e2e/us4.spec.ts`).

**Checkpoint**: All user stories should now be independently functional.

---

### Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, ensuring robustness, usability, and maintainability.

- [ ] T068 [P] Backend: Implement robust input validation for all API endpoints (`backend/src/api/**/*.ts`).
- [ ] T069 [P] Backend: Implement comprehensive error handling for all API endpoints (`backend/src/api/**/*.ts`).
- [ ] T070 [P] Frontend: Implement robust error display and handling for all API interactions (`frontend/src/services/**/*.ts`, `frontend/src/components/**/*.tsx`).
- [ ] T071 [P] Frontend: Implement loading states and visual feedback for all data fetches (`frontend/src/components/**/*.tsx`).
- [ ] T072 [P] Frontend: Implement responsive design considerations for all admin and coach pages (`frontend/src/pages/**/*.tsx`, `frontend/src/components/**/*.tsx`).
- [ ] T073 [P] Update `quickstart.md` to reflect any final changes to usage (`specs/006-camp-day-planner/quickstart.md`).
- [ ] T074 [P] Review and refactor codebase for consistency and maintainability (`backend/`, `frontend/`).
- [ ] T075 [P] Update project documentation (e.g., `README.md`, deployment guide).
- [ ] T076 E2E Test: Verify SC-001 (Organiser schedules camp under 30 mins) (`frontend/tests/e2e/sc1_performance.spec.ts`).
- [ ] T077 E2E Test: Verify SC-002 (Coach view mobile load under 3 secs) (`frontend/tests/e2e/sc2_performance_mobile.spec.ts`).
- [ ] T078 E2E Test: Test unauthenticated access to admin APIs returns 401/403 (`frontend/tests/e2e/security.spec.ts`).
- [ ] T079 E2E Test: Verify SC-004 (100% drag-and-drop updates persisted) (`frontend/tests/e2e/us3_persistence.spec.ts`).
- [ ] T080 E2E Test: Verify soft-delete behavior for `Camp` and `Stream` with associated data (`frontend/tests/e2e/edge_cases_deletion.spec.ts`).

---

## Dependencies & Execution Order

### Phase Dependencies

-   **Setup (Phase 1)**: No dependencies - can start immediately.
-   **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
-   **User Stories (Phase 3-6)**: All depend on Foundational phase completion.
    -   User stories can then proceed in parallel (if staffed).
    -   Or sequentially in priority order (P1 → P2 → P3 → P4).
-   **Polish (Phase 7)**: Depends on all user stories (Phase 3-6) being functionally complete.

### User Story Dependencies

-   **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories.
-   **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No direct implementation dependencies on US1, but integrates into the admin UI.
-   **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No direct implementation dependencies on US1 or US2, but integrates into the admin UI.
-   **User Story 4 (P4)**: Can start after Foundational (Phase 2) - No direct implementation dependencies on US1, US2 or US3, but integrates into the admin UI.

### Within Each User Story

-   Tests MUST be written and FAIL before implementation.
-   Services should be implemented before API routes that use them.
-   Backend API routes should be implemented before Frontend API clients.
-   Frontend components should be built before pages that use them.
-   E2E tests verify the complete flow after implementation.

### Parallel Opportunities

-   All Setup tasks marked [P] can run in parallel.
-   All Foundational tasks marked [P] can run in parallel.
-   Once the Foundational phase completes, different user stories (Phases 3-6) can be worked on in parallel by different team members.
-   Within each user story, tasks marked [P] (e.g., unit/component tests, backend services, frontend components) can run in parallel.
-   Backend and Frontend development for a given user story can proceed in parallel once API contracts are stable.

---

## Parallel Example: User Story 1

```bash
# Backend services and API routes for US1 can be developed in parallel:
- [ ] T020 [P] [US1] Backend: Implement `CampDayService` for CRUD operations on `CampDays` (backend/src/services/CampDayService.ts).
- [ ] T021 [P] [US1] Backend: Create API routes for `CampDays` (list, create, update, delete) (backend/src/api/campDays.ts).

# Frontend API clients and components for US1 can be developed in parallel:
- [ ] T022 [P] [US1] Frontend: Create API clients for `CampDay` CRUD (frontend/src/services/CampDayApi.ts).
- [ ] T023 [P] [US1] Frontend: Create `CampDayForm` component (frontend/src/components/CampDayForm.tsx).
- [ ] T024 [P] [US1] Frontend: Create `CampDayList` component (frontend/src/components/CampDayList.tsx).
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1.  Complete Phase 1: Setup
2.  Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3.  Complete Phase 3: User Story 1 (P1)
4.  **STOP and VALIDATE**: Test User Story 1 independently using its E2E test.
5.  Deploy/demo if ready.

### Incremental Delivery

1.  Complete Setup + Foundational → Foundation ready.
2.  Add User Story 1 (P1) → Test independently → Deploy/Demo (MVP!).
3.  Add User Story 2 (P2) → Test independently → Deploy/Demo.
4.  Add User Story 3 (P3) → Test independently → Deploy/Demo.
5.  Add User Story 4 (P4) → Test independently → Deploy/Demo.

### Parallel Team Strategy

With multiple developers:

1.  Team completes Setup + Foundational together.
2.  Once Foundational is done:
    -   Developer A: User Story 1
    -   Developer B: User Story 2
    -   Developer C: User Story 3
    -   Developer D: User Story 4
3.  Stories complete and integrate independently.

---

## Notes

-   [P] tasks = different files, no dependencies.
-   [Story] label maps task to specific user story for traceability.
-   Each user story should be independently completable and testable.
-   Verify tests fail before implementing.
-   Commit after each task or logical group.
-   Stop at any checkpoint to validate story independently.
-   Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence.