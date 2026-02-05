# Feature Specification: Camp Day Planner

**Feature Branch**: `006-camp-day-planner`  
**Created**: 2026-02-03  
**Status**: Draft  
**Input**: User description: "Create a new feature spec: \"006-camp-day-planner\". Scope: Design a drag-and-drop planner for daily schedules..."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Define Camp Days (Priority: P1)

As an organiser, I want to define the individual days of a `Camp` (e.g., Friday–Sunday) so I can create a schedule of activities for each day.

**Why this priority**: This is the first step in creating a schedule. Sessions cannot be created until the days of the camp are defined.

**Acceptance Scenarios**:

1. **Given** I am viewing the schedule planner for a `Camp`, **When** I add a new day with a date and a label (e.g., "Day 1"), **Then** the new day appears in the UI, and a `CampDays` record is created in the database.

### User Story 2 - Schedule Sessions (Priority: P2)

As an organiser, I want to create named `Sessions` on each day with start/end times and assign them to one or more `Streams`, so I can build out the detailed camp schedule.

**Why this priority**: This is the core planning activity, allowing organisers to structure the entire camp program.

**Acceptance Scenarios**:

1. **Given** a `CampDay` has been created, **When** I create a new `Session` with a name, start/end time, and location, **Then** the session appears on the visual timeline for that day.
2. **Given** a `Session` exists, **When** I assign it to the "9–14 Elite" and "14–19 Dev" streams, **Then** `SessionStreams` records are created to link the session to those streams.

### User Story 3 - Visually Adjust Schedule (Priority: P3)

As an organiser, I want to drag and drop `Sessions` on a visual timeline to adjust the schedule quickly, so I can easily resolve conflicts or make changes.

**Why this priority**: Provides a fast and intuitive UI for managing a complex schedule, which is a key part of the "organiser-first" principle.

**Acceptance Scenarios**:

1. **Given** a `Session` is displayed on the timeline, **When** I drag it to a new time slot, **Then** its `start_time` and `end_time` are updated in the database via an API call.
2. **Given** I attempt to drag a `Session` so it overlaps with another `Session` assigned to the same `Stream`, **Then** the UI should visually flag the conflict or prevent the drop.

### User Story 4 - Read-Only Coach View (Priority: P4)

As a coach, I want a simple, read-only view of my assigned day's schedule, filtered by my `Stream`, so I can see where I need to be and when, directly from my phone.

**Why this priority**: Empowers coaches by giving them direct access to the information they need without needing to go through an organiser.

**Acceptance Scenarios**:

1. **Given** a valid URL for a specific camp day and stream (e.g., `/coach/camps/1/day/1?streamId=1`), **When** I open it, **Then** I see a read-only list or timeline of only the sessions for that day and stream.

### Edge Cases
- What happens if an organiser tries to delete a `Camp` that already has `CampDays` and `Sessions` scheduled? The system should prevent the deletion and show a warning message explaining that the entity is in use. A "soft delete" or "archive" functionality should be used instead.
- What happens if an organiser tries to delete a `Stream` that is currently assigned to one or more `Sessions`? The deletion should be prevented to avoid orphan data in the `SessionStreams` join table.

## Requirements *(mandatory)*

### Assumptions
- This feature requires a modification to the base database schema defined in `001-d1-database-schema`. New tables (`CampDays`, `Sessions`, `SessionStreams`, and `Streams`) will be added.
- The concept of `Streams` (e.g., "9–14 Elite") exists as a new data entity that can be created and managed by organisers.

### Functional Requirements
- **FR-001**: The system MUST add `CampDays`, `Sessions`, and `SessionStreams` tables to the database schema. It must also add a `Streams` table for managing the different participant groups.
  ```sql
  CREATE TABLE CampDays (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      camp_id INTEGER NOT NULL,
      date DATE NOT NULL,
      label TEXT, -- e.g., "Day 1", "Friday"
      FOREIGN KEY (camp_id) REFERENCES Camps(id)
  );
  CREATE TABLE Streams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      camp_id INTEGER NOT NULL,
      name TEXT NOT NULL, -- e.g., "9–14 Elite", "Seniors"
      FOREIGN KEY (camp_id) REFERENCES Camps(id)
  );
  CREATE TABLE Sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      camp_day_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      start_time TEXT NOT NULL, -- "HH:MM"
      end_time TEXT NOT NULL,   -- "HH:MM"
      location TEXT,
      FOREIGN KEY (camp_day_id) REFERENCES CampDays(id)
  );
  CREATE TABLE SessionStreams (
      session_id INTEGER NOT NULL,
      stream_id INTEGER NOT NULL,
      PRIMARY KEY (session_id, stream_id),
      FOREIGN KEY (session_id) REFERENCES Sessions(id),
      FOREIGN KEY (stream_id) REFERENCES Streams(id)
  );
  ```
- **FR-002**: The system MUST provide the following API endpoints, restricted to authenticated organisers:
  - `GET, POST, PUT, DELETE /api/admin/camps/:campId/days` (for managing CampDays)
  - `GET, POST, PUT, DELETE /api/admin/camps/:campId/streams` (for managing Streams)
  - `GET, POST /api/admin/camps/:campId/days/:dayId/sessions` (for creating/listing Sessions for a day)
  - `PUT /api/admin/sessions/:sessionId` (for updating Session details, including drag-and-drop time adjustments)
  - `DELETE /api/admin/sessions/:sessionId` (for deleting Sessions)
  - `POST /api/admin/sessions/:sessionId/streams` (for assigning Streams to a Session)
  - `DELETE /api/admin/sessions/:sessionId/streams/:streamId` (for unassigning Streams from a Session)
- **FR-003**: The admin UI at `/admin/camps/:campId/schedule` MUST provide a drag-and-drop interface for managing sessions on a timeline.
- **FR-004**: Dragging a session MUST trigger a `PUT` request to `/api/admin/sessions/:sessionId` to update its times.
- **FR-005**: The UI MUST prevent or visually flag scheduling overlaps for sessions within the same `Stream`.
- **FR-006**: A public, read-only coach view MUST be available at `/coach/camps/:campId/day/:dayId`. This view is publicly accessible without authentication. It must filter sessions based on a `streamId` query parameter.

### Key Entities *(include if feature involves data)*
- **Camp**: The parent entity for the schedule.
- **CampDays**: A new entity representing a single day within a camp.
- **Streams**: A new entity representing a participant group (e.g., by age or skill).
- **Sessions**: A new entity representing a scheduled block of time (e.g., "On-ice skills").
- **SessionStreams**: A new join table linking sessions to streams.

## Success Criteria *(mandatory)*

### Measurable Outcomes
- **SC-001**: An organiser can fully schedule a 3-day camp with 5 sessions per day across 2 streams in under 30 minutes using the UI.
- **SC-002**: A coach can access their filtered, read-only daily schedule by opening a single URL, with the page loading in under 3 seconds on a mobile device.
- **SC-003**: The schedule data created through this feature MUST be queryable and available for future features, such as per-session attendance tracking.
- **SC-004**: 100% of updates made via the drag-and-drop interface are successfully persisted to the database.