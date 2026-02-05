---

description: "Generate an actionable, dependency-ordered tasks.md for the feature based on available design artifacts."
---

# Tasks: Camp and Settings Management

**Input**: Design documents from `/specs/005-camp-and-settings-management/`
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

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented, including authentication and common database access.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T010 Ensure authentication middleware is configured for `/api/admin/settings` routes (`backend/src/api/middleware/auth.ts`).
- [ ] T011 Setup D1 database connection utility and ensure compatibility with new entities (`backend/src/services/db.ts`).
- [ ] T012 Implement generic data access layer (DAL) for CRUD operations on new entities (`backend/src/services/dataAccess.ts`).
- [ ] T013 Implement basic shared utility functions (e.g., error handling, logging) in backend (`backend/src/services/utils.ts`).
- [ ] T014 Implement basic shared utility functions (e.g., API client, error handling) in frontend (`frontend/src/services/utils.ts`).

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Manage Camps and Products (Priority: P1) 🎯 MVP

**Goal**: As an organiser, I want to create a new `Camp` for an upcoming year, and attach `Products` to it, so that new orders can be correctly ingested and associated with the right event. Also create new `Product`.

**Independent Test**: An authenticated organiser can create a new camp, create a new product, and then associate that product with the newly created camp, viewing all changes in the admin UI.

### Tests for User Story 1

- [ ] T015 [P] [US1] Unit test `CampService` (CRUD operations) (`backend/tests/services/CampService.test.ts`).
- [ ] T016 [P] [US1] Unit test `ProductService` (CRUD operations) (`backend/tests/services/ProductService.test.ts`).
- [ ] T017 [P] [US1] Unit test `CampProductService` (association operations) (`backend/tests/services/CampProductService.test.ts`).
- [ ] T018 [P] [US1] Integration test for `Camp` API routes (`backend/tests/api/CampRoutes.test.ts`).
- [ ] T019 [P] [US1] Integration test for `Product` API routes (`backend/tests/api/ProductRoutes.test.ts`).
- [ ] T020 [P] [US1] Integration test for `CampProduct` API routes (`backend/tests/api/CampProductRoutes.test.ts`).
- [ ] T021 [P] [US1] Component test for `CampForm` (`frontend/tests/components/CampForm.test.tsx`).
- [ ] T022 [P] [US1] Component test for `ProductForm` (`frontend/tests/components/ProductForm.test.tsx`).
- [ ] T023 [P] [US1] Component test for `CampProductAssociationForm` (`frontend/tests/components/CampProductAssociationForm.test.tsx`).

### Implementation for User Story 1

- [ ] T024 [P] [US1] Backend: Implement `CampService` for CRUD operations on `Camp` (`backend/src/services/CampService.ts`).
- [ ] T025 [P] [US1] Backend: Implement `ProductService` for CRUD operations on `Product` (`backend/src/services/ProductService.ts`).
- [ ] T026 [P] [US1] Backend: Implement `CampProductService` for associating `Products` with `Camps` (`backend/src/services/CampProductService.ts`).
- [ ] T027 [P] [US1] Backend: Create API routes for `Camp` (list, get, create, update) (`backend/src/api/camps.ts`).
- [ ] T028 [P] [US1] Backend: Create API routes for `Product` (list, get, create, update) (`backend/src/api/products.ts`).
- [ ] T029 [P] [US1] Backend: Create API routes for `CampProduct` (list, create) (`backend/src/api/campProducts.ts`).
- [ ] T030 [P] [US1] Frontend: Create API clients for Camp CRUD (`frontend/src/services/CampApi.ts`).
- [ ] T031 [P] [US1] Frontend: Create API clients for Product CRUD (`frontend/src/services/ProductApi.ts`).
- [ ] T032 [P] [US1] Frontend: Create API clients for CampProduct operations (`frontend/src/services/CampProductApi.ts`).
- [ ] T033 [P] [US1] Frontend: Create `CampForm` component (`frontend/src/components/CampForm.tsx`).
- [ ] T034 [P] [US1] Frontend: Create `ProductForm` component (`frontend/src/components/ProductForm.tsx`).
- [ ] T035 [P] [US1] Frontend: Create `CampProductAssociationForm` component (`frontend/src/components/CampProductAssociationForm.tsx`).
- [ ] T036 [US1] Frontend: Create Admin Settings page (`/admin/settings`) to manage Camps and Products (`frontend/src/pages/admin/settings/index.tsx`, `frontend/src/pages/admin/settings/camps.tsx`, `frontend/src/pages/admin/settings/products.tsx`).
- [ ] T037 [US1] E2E Test: Organiser creates a new Camp, creates a new Product, then associates the Product with the Camp (`frontend/tests/e2e/us1.spec.ts`).

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Configure Camp-Specific Reminders (Priority: P2)

**Goal**: As an organiser, I want to configure reminder settings for each `Camp` individually, so that I can control the follow-up process without needing developer intervention.

**Independent Test**: An authenticated organiser can select a camp, update its reminder settings (interval, max count), save the changes, and verify the changes are persisted.

### Tests for User Story 2

- [ ] T038 [P] [US2] Unit test `CampSettingsService` (CRUD operations) (`backend/tests/services/CampSettingsService.test.ts`).
- [ ] T039 [P] [US2] Integration test for `CampSettings` API routes (`backend/tests/api/CampSettingsRoutes.test.ts`).
- [ ] T040 [P] [US2] Component test for `CampSettingsForm` (`frontend/tests/components/CampSettingsForm.test.tsx`).

### Implementation for User Story 2

- [ ] T041 [P] [US2] Backend: Implement `CampSettingsService` for managing reminder settings (`backend/src/services/CampSettingsService.ts`).
- [ ] T042 [P] [US2] Backend: Create API routes for `CampSettings` (get, update) (`backend/src/api/campSettings.ts`).
- [ ] T043 [P] [US2] Frontend: Create API clients for CampSettings operations (`frontend/src/services/CampSettingsApi.ts`).
- [ ] T044 [P] [US2] Frontend: Create `CampSettingsForm` component (`frontend/src/components/CampSettingsForm.tsx`).
- [ ] T045 [US2] Frontend: Integrate `CampSettingsForm` into Admin Settings page (`frontend/src/pages/admin/settings/reminders.tsx`).
- [ ] T046 [US2] E2E Test: Organiser updates CampSettings and verifies persistence (`frontend/tests/e2e/us2.spec.ts`).

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - Edit Products Safely (Priority: P3)

**Goal**: As an organiser, I want to edit `Products` (e.g., change the price on a `CampProduct`), so that I can make corrections while ensuring past orders are not affected.

**Independent Test**: An authenticated organiser can edit the price of an existing `CampProduct`, confirm that the new price is reflected for new associations, and verify that a historical `Purchase` record (if applicable) retains its original price. Additionally, an organiser can attempt to deactivate a Camp with associated purchases, and the system prevents full deletion, suggesting soft delete.

### Tests for User Story 3

- [ ] T047 [P] [US3] Unit test `ProductService` for safe price updates (`backend/tests/services/ProductService.test.ts`).
- [ ] T048 [P] [US3] Unit test `CampProductService` for safe price updates (`backend/tests/services/CampProductService.test.ts`).
- [ ] T049 [P] [US3] Unit test `CampService` for soft delete logic (`backend/tests/services/CampService.test.ts`).
- [ ] T050 [P] [US3] Integration test for `PUT /admin/settings/products/{productId}` ensuring historical immutability (`backend/tests/api/ProductRoutes.test.ts`).
- [ ] T051 [P] [US3] Integration test for `PUT /admin/settings/camps/{campId}/products/{productId}` ensuring historical immutability (`backend/tests/api/CampProductRoutes.test.ts`).
- [ ] T052 [P] [US3] Integration test for `PATCH /admin/settings/camps/{campId}/deactivate` (and potential conflict response) (`backend/tests/api/CampRoutes.test.ts`).

### Implementation for User Story 3

- [ ] T053 [P] [US3] Backend: Implement logic in `ProductService` for safe updates that do not affect historical purchases (`backend/src/services/ProductService.ts`).
- [ ] T054 [P] [US3] Backend: Implement logic in `CampProductService` for safe updates that do not affect historical purchases (`backend/src/services/CampProductService.ts`).
- [ ] T055 [P] [US3] Backend: Implement `deactivateCamp` logic in `CampService`, including checks for associated purchases (`backend/src/services/CampService.ts`).
- [ ] T056 [P] [US3] Backend: Add API route `PATCH /admin/settings/camps/{campId}/deactivate` (`backend/src/api/camps.ts`).
- [ ] T057 [P] [US3] Frontend: Update `ProductForm` to handle safe product edits (`frontend/src/components/ProductForm.tsx`).
- [ ] T058 [P] [US3] Frontend: Update `CampProductAssociationForm` to handle safe CampProduct edits (`frontend/src/components/CampProductAssociationForm.tsx`).
- [ ] T059 [P] [US3] Frontend: Implement `Deactivate Camp` UI button/action with warning message (`frontend/src/components/CampForm.tsx`, `frontend/src/pages/admin/settings/camps.tsx`).
- [ ] T060 [US3] E2E Test: Organiser edits `CampProduct` price, verifies new behavior for new purchases, and confirms old purchases are unaffected (`frontend/tests/e2e/us3_price_edit.spec.ts`).
- [ ] T061 [US3] E2E Test: Organiser attempts to deactivate a Camp with associated purchases, sees warning, then deactivates successfully (soft delete) (`frontend/tests/e2e/us3_camp_deactivation.spec.ts`).

**Checkpoint**: All user stories implemented so far should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, ensuring robustness, usability, and maintainability.

- [ ] T062 [P] Backend: Implement robust input validation for all API endpoints (`backend/src/api/**/*.ts`).
- [ ] T063 [P] Backend: Implement comprehensive error handling for all API endpoints (`backend/src/api/**/*.ts`).
- [ ] T064 [P] Frontend: Implement robust error display and handling for all API interactions (`frontend/src/services/**/*.ts`, `frontend/src/components/**/*.tsx`).
- [ ] T065 [P] Frontend: Implement loading states and visual feedback for all data fetches (`frontend/src/components/**/*.tsx`).
- [ ] T066 [P] Frontend: Implement responsive design considerations for all admin pages (`frontend/src/pages/admin/**/*.tsx`, `frontend/src/components/**/*.tsx`).
- [ ] T067 [P] Ensure SC-004 (clear feedback on success/failure) is implemented for all forms.
- [ ] T068 [P] Update `quickstart.md` to reflect any final changes to usage (`specs/005-camp-and-settings-management/quickstart.md`).
- [ ] T069 [P] Review and refactor codebase for consistency and maintainability (`backend/`, `frontend/`).
- [ ] T070 [P] Update project documentation (e.g., `README.md`, deployment guide).
- [ ] T071 E2E Test: Verify SC-001 (Camp, Product, Settings setup under 5 mins) (`frontend/tests/e2e/sc1_performance.spec.ts`).
- [ ] T072 E2E Test: Verify SC-002 (Email Ingestion success for new camp) - *Requires integration with 002-email-ingestion* (`frontend/tests/e2e/sc2_integration_002.spec.ts`).
- [ ] T073 E2E Test: Verify SC-003 (Reminder Engine uses new settings) - *Requires integration with 003-registration-and-reminders* (`frontend/tests/e2e/sc3_integration_003.spec.ts`).
- [ ] T074 E2E Test: Test unauthenticated access to admin settings APIs returns 401/403 (`frontend/tests/e2e/security.spec.ts`).

---

## Dependencies & Execution Order

### Phase Dependencies

-   **Setup (Phase 1)**: No dependencies - can start immediately.
-   **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
-   **User Stories (Phase 3-5)**: All depend on Foundational phase completion.
    -   User stories can then proceed in parallel (if staffed).
    -   Or sequentially in priority order (P1 → P2 → P3).
-   **Polish (Phase 6)**: Depends on all user stories (Phase 3-5) being functionally complete.

### User Story Dependencies

-   **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories.
-   **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No direct implementation dependencies on US1, but integrates into the admin UI.
-   **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No direct implementation dependencies on US1 or US2, but integrates into the admin UI.

### Within Each User Story

-   Tests MUST be written and FAIL before implementation.
-   Services should be implemented before API routes that use them.
-   Backend API routes should be implemented before Frontend API clients.
-   Frontend components should be built before pages that use them.
-   E2E tests verify the complete flow after implementation.

### Parallel Opportunities

-   All Setup tasks marked [P] can run in parallel.
-   All Foundational tasks marked [P] can run in parallel.
-   Once the Foundational phase completes, different user stories (Phases 3-5) can be worked on in parallel by different team members.
-   Within each user story, tasks marked [P] (e.g., unit/component tests, backend services, frontend components) can run in parallel.
-   Backend and Frontend development for a given user story can proceed in parallel once API contracts are stable.

---

## Parallel Example: User Story 1

```bash
# Backend services and API routes for US1 can be developed in parallel:
- [ ] T024 [P] [US1] Backend: Implement `CampService` for CRUD operations on `Camp` (backend/src/services/CampService.ts).
- [ ] T025 [P] [US1] Backend: Implement `ProductService` for CRUD operations on `Product` (backend/src/services/ProductService.ts).
- [ ] T026 [P] [US1] Backend: Implement `CampProductService` for associating `Products` with `Camps` (backend/src/services/CampProductService.ts).
- [ ] T027 [P] [US1] Backend: Create API routes for `Camp` (list, get, create, update) (backend/src/api/camps.ts).
- [ ] T028 [P] [US1] Backend: Create API routes for `Product` (list, get, create, update) (backend/src/api/products.ts).
- [ ] T029 [P] [US1] Backend: Create API routes for `CampProduct` (list, create) (backend/src/api/campProducts.ts).

# Frontend API clients and components for US1 can be developed in parallel:
- [ ] T030 [P] [US1] Frontend: Create API clients for Camp CRUD (frontend/src/services/CampApi.ts).
- [ ] T031 [P] [US1] Frontend: Create API clients for Product CRUD (frontend/src/services/ProductApi.ts).
- [ ] T032 [P] [US1] Frontend: Create API clients for CampProduct operations (frontend/src/services/CampProductApi.ts).
- [ ] T033 [P] [US1] Frontend: Create `CampForm` component (frontend/src/components/CampForm.tsx).
- [ ] T034 [P] [US1] Frontend: Create `ProductForm` component (frontend/src/components/ProductForm.tsx).
- [ ] T035 [P] [US1] Frontend: Create `CampProductAssociationForm` component (frontend/src/components/CampProductAssociationForm.tsx).
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

### Parallel Team Strategy

With multiple developers:

1.  Team completes Setup + Foundational together.
2.  Once Foundational is done:
    -   Developer A: User Story 1
    -   Developer B: User Story 2
    -   Developer C: User Story 3
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