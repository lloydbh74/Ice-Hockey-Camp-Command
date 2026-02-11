# Plan: Camp Day Planner

> **Feature**: `006-camp-day-planner`  
> **Goal**: Enable organisers to define camp days, schedule sessions assigned to streams, and manage them via a drag-and-drop interface. Provide a read-only view for coaches.

---

## Phase 1: Database Schema & Models

**Goal**: Establish the data structure for scheduling.

- [ ] T1.1: Create migration for `CampDays`, `Streams`, `Sessions`, `SessionStreams` tables
- [ ] T1.2: Add D1 definitions to `wrangler.toml` (verify existing)
- [ ] T1.3: Update `db.ts` with TypeScript interfaces for new entities
- [ ] T1.4: Implement `getCampDays`, `getStreams`, `getSessions` helper functions
- [ ] T1.5: Implement `createCampDay`, `createStream`, `createSession` helper functions
- [ ] T1.6: Implement `updateSession` (times) and `assignSessionStreams` helper functions

## Phase 2: Organiser API Endpoints

**Goal**: Provide backend CRUD operations for the admin UI.

- [ ] T2.1: Implement `GET/POST /api/admin/camps/[id]/days`
- [ ] T2.2: Implement `DELETE /api/admin/camps/[id]/days/[dayId]`
- [ ] T2.3: Implement `GET/POST /api/admin/camps/[id]/streams`
- [ ] T2.4: Implement `DELETE /api/admin/camps/[id]/streams/[streamId]`
- [ ] T2.5: Implement `GET/POST /api/admin/camps/[id]/days/[dayId]/sessions`
- [ ] T2.6: Implement `PUT /api/admin/sessions/[sessionId]` and `DELETE /api/admin/sessions/[sessionId]`
- [ ] T2.7: Implement `POST /api/admin/sessions/[sessionId]/streams` and `DELETE .../streams/[streamId]`

## Phase 3: Schedule UI (Camp & Streams Setup)

**Goal**: Allow organisers to set up the basic structure (Days & Streams) before detailed scheduling.

- [ ] T3.1: Create `CampScheduleLayout` and `ScheduleSidebar`
- [ ] T3.2: Implement "Manage Days" modal/view
- [ ] T3.3: Implement "Manage Streams" modal/view
- [ ] T3.4: Integrate with `CampDay` and `Stream` APIs

## Phase 4: Drag-and-Drop Session Planner

**Goal**: The core interactive scheduler.

- [ ] T4.1: Install `@dnd-kit/core` or similar (if not present, or use native HTML5 DnD)
- [ ] T4.2: Build `TimelineGrid` component (Time slots vs Streams)
- [ ] T4.3: Build `SessionCard` component
- [ ] T4.4: Implement "Create Session" modal
- [ ] T4.5: Implement drag-to-update logic and API integration
- [ ] T4.6: Implement conflict detection (visual overlap)

## Phase 5: Coach View (Read-Only)

**Goal**: Mobile-friendly view for coaches.

- [ ] T5.1: Create public route `/coach/camps/[id]/day/[dayId]`
- [ ] T5.2: Implement `GET` logic in `page.tsx` (using `getCampDays` and `getSessions`)
- [ ] T5.3: Build read-only `DailyScheduleList` component
- [ ] T5.4: Implement Stream filtering (via URL query param)

## Phase 6: Verification & Polish

**Goal**: Ensure the feature is robust and usable.

- [ ] T6.1: Verify Day/Stream deletion constraints (prevent if used)
- [ ] T6.2: Test drag-and-drop persistence
- [ ] T6.3: Verify Read-Only view on mobile
- [ ] T6.4: UI Performance check (with 50+ sessions)
