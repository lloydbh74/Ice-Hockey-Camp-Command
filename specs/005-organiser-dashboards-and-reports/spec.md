# Feature Specification: Organiser Dashboards and Reports

**Feature Branch**: `004-organiser-dashboards-and-reports`  
**Created**: 2026-02-03  
**Status**: Draft  
**Input**: User description: "Create a new feature spec: \"004-organiser-dashboards-and-reports\". Scope: Design the organiser-facing web UI and backend endpoints..."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Camp Summary Dashboard (Priority: P1)

As an organiser, I want a Camp Dashboard page where I can see high-level statistics for a selected camp, so that I can get a quick overview of the registration progress.

**Why this priority**: This is the main entry point for organisers and provides the most critical, at-a-glance information.

**Acceptance Scenarios**:

1. **Given** I am an authenticated organiser, **When** I navigate to the admin dashboard, **Then** I see a list of available camps.
2. **Given** I select a camp, **When** the Camp Dashboard page loads, **Then** I see the total number of purchases, the number of completed registrations, and the number of missing registrations.
3. **Given** I am on the Camp Dashboard, **When** I click the "View Attendance" link, **Then** I am navigated to the Attendance List view for that camp.

### User Story 2 - Daily Attendance View (Priority: P2)

As an organiser, I want a per-day Attendance List view for a given camp, so that I know exactly who should be on the ice on any given day.

**Why this priority**: This is a critical operational view for the day-to-day running of the camp.

**Acceptance Scenarios**:

1. **Given** I am on the Attendance List page for a camp, **When** I select a date, **Then** the list shows all players registered for that day.
2. **Given** the registration data is dynamic, **When** I view a player's details, **Then** I can see their specific form responses (e.g., medical notes) in a detail modal or expanded row, rather than fixed columns.
2. **Given** I am on the Attendance List page, **When** I click the "Export to CSV" button, **Then** a CSV file is downloaded containing all the data currently displayed on the screen.

### User Story 3 - Kit Order Summary (Priority: P3)

As an organiser, I want a Kit Orders view that summarises all shorts/jersey sizes and quantities, so that I can place an accurate bulk order with the supplier.

**Why this priority**: This is essential for logistics and ensuring all players receive their correct kit.

**Acceptance Scenarios**:

1. **Given** I am on the Kit Orders page for a camp, **When** the page loads, **Then** I see a summary table with rows for each item type/size (e.g., 'Jersey - L') and a column for the total quantity required.
2. **Given** I am on the Kit Orders page, **When** I click the "Export to CSV" button, **Then** a CSV file is downloaded containing the summary data.

### User Story 4 - Chase Missing Registrations (Priority: P4)

As an organiser, I want a Missing Registrations list, so that I can manually follow up with guardians who have not completed their registration.

**Why this priority**: This helps ensure all data is collected before the camp starts.

**Acceptance Scenarios**:

1. **Given** I am on the Missing Registrations page for a camp, **When** the page loads, **Then** I see a list of all purchases where the `registration_state` is 'uninvited', 'invited', or 'inprogress', including the guardian's name and email.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a set of web pages under `/admin` for organisers.
- **FR-002**: The system MUST provide the following API endpoints, restricted to authenticated organisers:
  - `GET /api/admin/camps`
  - `GET /api/admin/camps/:campId/summary`
  - `GET /api/admin/camps/:campId/attendance?date=YYYY-MM-DD`
  - `GET /api/admin/camps/:campId/kit-orders`
  - `GET /api/admin/camps/:campId/missing-registrations`
- **FR-003**: Each of the primary data views (Attendance, Kit Orders, Missing Registrations) MUST have a corresponding CSV export endpoint (`GET /api/admin/camps/:campId/export/:type`).
- **FR-004**: The `attendance` view MUST query the database by joining `Registrations`, `Players`, and `Purchases` for the selected camp and date.
- **FR-005**: The `kit-orders` view MUST query the database by aggregating `KitOrders` (or parsing `Registration.form_response_json` if kit data is stored there) by `itemType` and `size` for the selected camp.
- **FR-006**: The `missing-registrations` view MUST query the database for `Purchases` with a `registration_state` of 'uninvited', 'invited', or 'inprogress'.
- **FR-008**: The Attendance View MUST support viewing dynamic form data. Since fields vary by form, they cannot be hardcoded columns. The UI should allow expanding a row to see the full `form_response_json` data formatted readably.
- **FR-007**: Access to all `/admin` pages and `/api/admin/*` endpoints MUST be restricted to authenticated organisers. Authentication will be via a magic-link system where a list of authorized organiser emails is stored in an environment variable, and organisers receive a one-time login link to their email.

### Key Entities *(include if feature involves data)*

- **Camp**: Used to scope all dashboards and reports.
- **Purchase**, **Registration**, **Player**, **KitOrder**: These entities are the primary sources of data for the views.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An authenticated organiser can navigate from the main dashboard to any of the three sub-reports (Attendance, Kit, Missing Registrations) in under 30 seconds.
- **SC-002**: All data displayed in the UI views MUST exactly match the data exported in the corresponding CSV files.
- **SC-003**: CSV files MUST download successfully and open without errors in standard spreadsheet software (MS Excel, Google Sheets).
- **SC-004**: Unauthenticated users attempting to access any `/api/admin/*` endpoint MUST receive a `401 Unauthorized` or `403 Forbidden` response in 100% of cases.