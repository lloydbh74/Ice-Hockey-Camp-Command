# Feature Specification: Registration Flow and Reminder Engine

**Feature Branch**: `003-registration-and-reminders`  
**Created**: 2026-02-03  
**Status**: Draft  
**Input**: User description: "Create a new feature spec: \"003-registration-and-reminders\". Scope: Design the registration flow and reminder engine..."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dynamic Form Builder (Priority: P1)

As an organiser, I want to create and edit registration forms using a drag-and-drop builder, so that I can collect exactly the data I need for a specific camp (e.g., specific medical consents, kit sizes with images) without needing a developer.

**Why this priority**: Essential for supporting the "exact replica" requirement of the paper forms and providing the requested flexibility.

**Acceptance Scenarios**:

1.  **Given** I am on the Form Builder page, **When** I drag a "Single Choice" element onto the canvas and add an image of a sizing chart, **Then** the form preview updates instantly to show the question with the image.
2.  **Given** I have created a complex form, **When** I click "Save as Template", **Then** it is saved to the `FormTemplates` library for future reuse.
3.  **Given** I am setting up a Camp Product, **When** I select "Assign Form", **Then** I can choose from my saved forms or templates.

### User Story 2 - Guardian Registration via Magic Link (Priority: P1)

As a guardian, when I click my unique registration link, I should see a branded form that validates my input and allows me to submit details for my child, matching the specific requirements of that camp.

**Acceptance Scenarios**:

1.  **Given** a valid registration link, **When** I load the page, **Then** the system renders the specific form schema assigned to that purchase's product.
2.  **Given** the form asks for "Jersey Size" with a visual chart, **When** I select "Large", **Then** my choice is recorded.
3.  **Given** the form has a "Digital Signature" field, **When** I type my name and check the box, **Then** it is treated as a valid signature for the consents.

### User Story 3 - Automated Registration Reminders (Priority: P2)

*(Unchanged from previous version - system must still send reminders based on completion status)*

## Requirements *(mandatory)*

### Functional Requirements

-   **FR-001**: The system MUST provide a **Form Builder UI** for organisers.
    -   Must support text inputs, multiple choice, checkboxes, and structure (sections/headers).
    -   **Critical**: Must support embedding **Images** within form questions (e.g., for sizing charts).
    -   Must support a "Digital Signature" component (text input + confirmation checkbox).
-   **FR-002**: The system MUST support **Form Templates**.
    -   A "Default Template" MUST be seeded that replicates the "Hockey Sweden Camp 3 Day Camp" Google Form exactly.
-   **FR-003**: The system MUST allow assigning a specific `Form` to a `Product` or `Camp`.
-   **FR-004**: The `POST /api/registration/submit` endpoint MUST accept a structured JSON payload corresponding to the form schema.
    -   The backend MUST map "System Fields" (First Name, Last Name, DOB) to the `Players` table.
    -   All other data (Medical, Kit, Consents) MUST be stored in a structured format (e.g., JSON column) linked to the Registration.
-   **FR-005**: The Registration Page (`GET /registration/:token`) MUST dynamically render the form based on the schema associated with the purchase.

### Key Entities

-   **FormTemplate**: A library of reusable form schemas.
-   **Form**: An instance of a form usage, potentially customized for a specific camp/product.
-   **Registration**: Now stores the `form_response` data alongside the core `player_id`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

-   **SC-001**: The "Default Template" created in the system MUST visibly match the provided Google Form screenshot (including the Jersey/Shorts sizing images) when rendered.
-   **SC-002**: An organiser can create a new form from a template, modify one question, and assign it to a product in under 2 minutes.
-   **SC-003**: Guardian submissions via the dynamic form are successfully parsed: core fields go to `Players`, custom fields go to `Registration.data`.