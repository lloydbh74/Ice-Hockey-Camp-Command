# Data Model: Email Ingestion API

This document describes the input data model for the Email Ingestion API and its mapping to the existing D1 database schema (`001-d1-database-schema`). This API does not define new database entities but rather processes external data into existing entities.

## API Input Data Model

The primary data model for this API is the JSON request body described in `spec.md` FR-003. This structure represents a normalized purchase order extracted from an email.

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

## Mapping to D1 Database Schema Entities

The input data fields map to the `Purchases`, `Guardians`, `Camps`, and `Products` tables defined in the `001-d1-database-schema` feature.

### Guardian Mapping
- `guardianEmail` (input) -> `Guardians.email` (database)
- `guardianName` (input) -> `Guardians.full_name` (database)

### Purchase Mapping
- A new `Purchase` record is created for each ingestion.
- `rawEmailId` (input) -> `Purchases.raw_email_id` (database)
- The `registration_state` is initially set to 'uninvited' in the database.
- `orderDate` (input) -> `Purchases.purchase_timestamp` (database)
- `orderId`, `orderReference`, `paymentMethod`, `totalAmount`, `currency`, `rawSource` are currently used for ingestion context but may not be stored directly in `Purchases` table without schema modification. These might be considered for a separate `OrderDetails` table or stored as a raw JSON blob if schema extension is not desired for this feature.
  *Decision*: For this feature, only fields directly mapping to the `Purchases` table are considered for storage. Other fields are used for context and validation during ingestion.

### Product and Camp Mapping
- `products[*].rawDescription` (input) -> Used to lookup `Products.name` (database) and subsequently `CampProducts.product_id` and `CampProducts.camp_id`.
  *Note*: The `spec.md` mentions a resolution for "Product Mapping Ambiguity" where upstream n8n system *MUST* embed a unique product SKU within `rawDescription` (e.g., `CIHA-S-W1-2026`) for direct lookup. This is a critical dependency for accurate mapping.

## Validation Rules and Business Logic

The API will enforce the following logic during ingestion:

- **Idempotency Check**: Uses `rawEmailId` to prevent duplicate `Purchase` records.
- **Guardian Management**: Creates a new `Guardian` if `guardianEmail` does not exist, or reuses an existing one.
- **Product/Camp Mapping**: Validates `products[*].rawDescription` against existing `Products` and `CampProducts` in the database.
- **Error Handling**: Logs critical errors and rejects requests with `400 Bad Request` for unknown products or malformed data.
- **Authentication**: Requires a valid Bearer token.
