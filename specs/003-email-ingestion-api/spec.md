# Feature Specification: Email Ingestion API

**Feature Branch**: `002-email-ingestion-api`  
**Created**: 2026-02-03  
**Status**: Draft  
**Input**: User description: "Create a new feature spec: \"002-email-ingestion-api\". Scope: Design the API and behaviour for ingesting parsed order confirmation emails into the D1 schema defined in 001-d1-database-schema..."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ingest Purchase Email (Priority: P1)

As the system, I need to accept normalised purchase data from an upstream service (n8n) so that each camp order email becomes a structured `Purchase` record in the database with a clear `registration_state` and camp association.

**Why this priority**: This is the primary entry point for all data into the application. Without this API, no registrations can be processed.

**Independent Test**: This feature can be tested by sending POST requests with various payloads to the API endpoint and verifying the state of the database and the API's response.

**Acceptance Scenarios**:

1. **Given** a valid and authorized API request with a new `rawEmailId`, **When** the endpoint is called, **Then** a new `Guardian` is created (if not existing), a new `Purchase` record is created with `registration_state` = 'uninvited', and the API returns a `201 Created` status with the new purchase ID.
2. **Given** a valid and authorized API request with a `rawEmailId` that already exists in the database, **When** the endpoint is called, **Then** no new records are created, and the API returns a `200 OK` status with the existing purchase ID and a message indicating it was already processed.
3. **Given** an API request with an invalid or missing bearer token, **When** the endpoint is called, **Then** the API returns a `401 Unauthorized` error.
4. **Given** a valid API request where the `products[*].rawDescription` does not map to a known `Product` in the database, **When** the endpoint is called, **Then** no `Purchase` record is created, an error is logged, and the API returns a `400 Bad Request` status.
5. **Given** a malformed request body (e.g., missing `guardianEmail`), **When** the endpoint is called, **Then** the API returns a `400 Bad Request` status with a JSON error response in the format `{"error": "string", "details": "array of strings"}` describing the validation failures.

### Edge Cases

- **Race Conditions**: What happens if two identical requests with the same new `rawEmailId` arrive at the same time? The database unique constraint on `Purchases.raw_email_id` (assuming one is added) should prevent duplicate creation, causing one request to fail.
- **Product Mapping Ambiguity**: How is "Hockey camp Sweden – Riverside – Week 1" mapped to a `Product` and `Camp`?
  **Resolution**: The upstream system (n8n) MUST embed a unique product SKU (e.g., `CIHA-S-W1-2026`) within the `products[*].rawDescription`. The API will extract this SKU for a direct lookup against `Products` and `CampProducts`. This requires a modification to the n8n workflow.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST expose a `POST /api/email-ingest/purchase` endpoint.
- **FR-002**: The endpoint MUST require a Bearer token for authentication. Unauthorized requests MUST be rejected.
- **FR-003**: The endpoint MUST accept a JSON request body with the structure defined below.
  ```json
  {
    "orderId": "string",
    "orderReference": "string",
    "guardianEmail": "string",
    "guardianName": "string",
    "paymentMethod": "string",
    "totalAmount": "number",
    "currency": "string",
    "orderDate": "string (ISO 8601)",
    "products": [
      { "rawDescription": "string", "quantity": "number" }
    ],
    "rawEmailId": "string",
    "rawSource": "string"
  }
  ```
- **FR-004**: The system MUST be idempotent. If a request with a previously processed `rawEmailId` is received, it MUST NOT create duplicate records.
- **FR-005**: Upon successful ingestion of a new purchase, the system MUST create a `Purchases` record with its `registration_state` set to 'uninvited'.
- **FR-006**: The system MUST look up a `Guardian` by `guardianEmail`. If no `Guardian` exists, a new one MUST be created.
- **FR-007**: The system MUST attempt to map the `rawDescription` from the payload to a valid `Product` and associated `Camp` in the database.
- **FR-008**: If a product cannot be mapped, the system MUST log this as an ERROR level event, report it to monitoring/alerting systems as a critical failure, and MUST NOT create a `Purchase` record for that item.

### Key Entities *(include if feature involves data)*

- **Purchase**: The primary entity created by this feature. It represents a record of a sale and drives the registration workflow.
- **Guardian**: The person who made the purchase. This feature will create or look up guardians.
- **Camp**: Looked up and associated with the `Purchase`.
- **Product**: Looked up and associated with the `Purchase`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Given a valid payload for a known camp product, a `Purchase` row is created with `registration_state`='uninvited' and can be queried by `Camp`.
- **SC-002**: Given a repeat call with the same `rawEmailId`, no duplicate `Purchase` records are created, and the system returns a success response indicating the record already exists.
- **SC-003**: 100% of ingestion attempts with invalid authentication tokens are rejected with a `401` error.
- **SC-004**: 100% of ingestion attempts for unknown products are rejected with a `400` error and logged appropriately, with no partial data being saved.