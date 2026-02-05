# Feature Specification: Camp and System Management

**Feature Branch**: `002-camp-and-system-management`  
**Created**: 2026-02-03  
**Status**: Draft  
**Input**: User description: "Create a new feature spec: \"002-camp-and-system-management\". Scope: Design the admin Settings area including global system configuration..."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage Camps and Products (Priority: P1)

As an organiser, I want to create a new `Camp` for an upcoming year, and attach `Products` to it, so that new orders can be correctly ingested and associated with the right event.

**Why this priority**: This is the foundational setup step required to configure the system for a new season or event. Without it, no other actions can be performed for a new camp.

**Acceptance Scenarios**:

1. **Given** I am on the `/admin/settings/camps` page, **When** I fill out and submit the "Create New Camp" form (name, year, etc.), **Then** a new `Camp` record is created in the database and appears in the list.
2. **Given** a `Camp` exists, **When** I navigate to its product settings page, **Then** I can associate existing `Products` with it, creating `CampProducts` records.
3. **Given** I am on the `/admin/settings/products` page, **When** I create a new `Product`, **Then** it becomes available to be associated with any camp.
4. **Given** I have a customized Form Template, **When** I create/edit a `Product`, **Then** I can select a `FormTemplate` to generate the `Form` structure for that product.

### User Story 2 - Configure Camp-Specific Reminders (Priority: P2)

As an organiser, I want to configure reminder settings for each `Camp` individually, so that I can control the follow-up process without needing developer intervention.

**Why this priority**: This provides crucial operational flexibility and empowers organisers to manage their own communication workflows.

**Acceptance Scenarios**:

1. **Given** I am on the `/admin/settings/reminders` page and select a `Camp`, **When** I update the reminder interval and max reminder count and save, **Then** the changes are persisted to the `CampSettings` table for that camp.
2. **Given** the reminder settings for a camp have been updated, **When** the Reminder Engine runs, **Then** it uses the new settings to determine which guardians to contact.

### User Story 3 - Edit Products Safely (Priority: P3)

As an organiser, I want to edit `Products` (e.g., change the price on a `CampProduct`), so that I can make corrections while ensuring past orders are not affected.

**Why this priority**: Allows for administrative corrections and price adjustments for future sales.

**Acceptance Scenarios**:

1. **Given** a `CampProduct` exists, **When** I edit its price, **Then** the new price is saved, and this new price will be used for any future calculations, without affecting `Purchase` records that were created before the change.

### User Story 4 - Global System Settings (Priority: P2)

As a super-admin, I want to manage global system configurations (e.g., list of admin emails, SMTP settings, feature flags) via a UI, so that I can change the system behaviour without redeploying code.

**Why this priority**: Essential for maintaining the app in production without developer intervention for minor changes.

**Acceptance Scenarios**:

1.  **Given** I am a super-admin on the `/admin/settings/system` page, **When** I add a new email to the "Admin Access List", **Then** that user can immediately request a magic link login.
2.  **Given** I update the "Support Email Address" setting, **When** the system sends a new email, **Then** the "Reply-To" header reflects this new value.

### Edge Cases

- What happens if an organiser tries to delete a `Product` or `Camp` that already has `Purchase` records associated with it? The system should prevent the deletion and show a warning message explaining that the entity is in use. A "soft delete" or "archive" functionality should be used instead.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide an admin UI at `/admin/settings` with sections for managing camps, products, and reminders.
- **FR-002**: Organisers MUST be able to Create, Read, Update, and Deactivate `Camps`. Deactivating a camp should prevent new purchases from being associated with it.
- **FR-003**: Organisers MUST be able to Create, Read, Update, and Deactivate `Products`. Deactivating a product should prevent new associations with camps.
- **FR-004**: Organisers MUST be able to associate `Products` with `Camps`, creating `CampProduct` records that represent a specific product being sold for a specific camp.
- **FR-008**: The Product creation/edit UI MUST allow the organiser to select a `FormTemplate`. This selection triggers the creation/update of a `Form` record linked to that product.
- **FR-005**: The `/admin/settings/reminders` UI MUST allow organisers to define the reminder settings for each `Camp`.
- **FR-006**: The system MUST store these settings in the `CampSettings` table, as decided in the specification for feature `003-registration-and-reminders`.
- **FR-007**: When a `Product` or `CampProduct` is edited, the changes MUST NOT retroactively alter historical `Purchase` records.
- **FR-009**: The system MUST provide an interface at `/admin/settings/system` to manage key-value pairs in the `SystemSettings` table.
- **FR-010**: Critical settings (e.g., Admin List) MUST be validated before saving (e.g., ensure valid email format).

### Key Entities *(include if feature involves data)*

- **Camp**: Created and managed in this feature.
- **Product**: Created and managed in this feature.
- **CampProduct**: The association between a `Camp` and a `Product`, managed in this feature.
- **CampSettings**: The reminder settings for a camp, managed in this feature.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An organiser can successfully create a new `Camp`, associate a `Product` with it, and configure its reminder settings, all through the admin UI, in under 5 minutes.
- **SC-002**: Once a new camp is configured, the Email Ingestion feature (`002`) MUST be able to successfully ingest a purchase for that new camp.
- **SC-003**: Once a camp's reminder settings are configured, the Reminder Engine (`003`) MUST use those specific settings for its next run.
- **SC-004**: All forms in the settings UI MUST provide clear feedback on success or failure (e.g., "Camp created successfully," "Invalid date format").