# Quickstart: Email Ingestion API

This guide provides a quick introduction to deploying and interacting with the Email Ingestion API, which runs as a Cloudflare Worker.

## Prerequisites

-   Cloudflare account with Workers and D1 enabled.
-   `wrangler` CLI installed and configured.
-   A deployed D1 database (from `001-d1-database-schema` feature).
-   An API authentication token (Bearer token).

## 1. Deploying the Email Ingestion API Worker

The Email Ingestion API is a Cloudflare Worker that will expose a `POST /api/email-ingest/purchase` endpoint.

1.  **Worker Project Setup**: Assuming your project structure includes `backend/src/` for Worker code, create a `wrangler.toml` in your project root, and your Worker entry point (e.g., `backend/src/index.ts`).
    ```toml
    # wrangler.toml example
    name = "email-ingestion-api"
    main = "backend/src/index.ts"
    compatibility_date = "2024-01-01"

    [vars]
    AUTH_TOKEN = "<YOUR_SECRET_AUTH_TOKEN>" # Used for API authentication

    [[d1_databases]]
    binding = "DB" # D1Database gets bound to `env.DB` in your Worker
    database_name = "ciha-swedish-camp-db" # Name of your D1 database
    database_id = "<YOUR_D1_DATABASE_ID>" # ID of your D1 database from 001-d1-database-schema
    ```

2.  **Implement Worker Logic**: Implement the API endpoint logic in `backend/src/index.ts` using Hono (as per `plan.md`). This logic will handle authentication, idempotency checks, data mapping to D1, and database interactions.

3.  **Deploy Worker**: Deploy your Worker using `wrangler`:
    ```bash
    wrangler deploy
    ```
    This will deploy your Worker and make your API endpoint accessible.

## 2. Interacting with the API

You can interact with the API using `curl` or any HTTP client.

### Endpoint

`POST https://<YOUR_WORKER_SUBDOMAIN>.workers.dev/api/email-ingest/purchase`

### Headers

-   `Content-Type: application/json`
-   `Authorization: Bearer <YOUR_SECRET_AUTH_TOKEN>`

### Request Body Example

```json
{
  "orderId": "ORDER-CIHA-2026-001",
  "guardianEmail": "guardian.test@example.com",
  "guardianName": "Test Guardian",
  "products": [
    {
      "rawDescription": "Hat-Trick Heroes 2026 Camp (CIHA-S-W1-2026)",
      "quantity": 1
    }
  ],
  "rawEmailId": "email-id-from-n8n-workflow-12345",
  "rawSource": "n8n email parser"
}
```

### Example `curl` Command

```bash
curl -X POST "https://<YOUR_WORKER_SUBDOMAIN>.workers.dev/api/email-ingest/purchase" 
     -H "Content-Type: application/json" 
     -H "Authorization: Bearer <YOUR_SECRET_AUTH_TOKEN>" 
     -d '{
           "orderId": "ORDER-CIHA-2026-001",
           "guardianEmail": "guardian.test@example.com",
           "guardianName": "Test Guardian",
           "products": [
             {
               "rawDescription": "Hat-Trick Heroes 2026 Camp (CIHA-S-W1-2026)",
               "quantity": 1
             }
           ],
           "rawEmailId": "email-id-from-n8n-workflow-12345",
           "rawSource": "n8n email parser"
         }'
```

Upon successful ingestion:
*   A `201 Created` status for new records.
*   A `200 OK` status for idempotent requests (already processed `rawEmailId`).

Refer to `contracts/api.yaml` for the full API specification and response details.
