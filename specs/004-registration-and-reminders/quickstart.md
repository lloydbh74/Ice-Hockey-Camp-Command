# Quickstart: Registration Flow and Reminder Engine

This guide provides a quick introduction to deploying and interacting with the Registration Flow and Reminder Engine. It covers the frontend registration page, backend APIs, and the scheduled reminder worker.

## Prerequisites

-   Cloudflare account with Pages, Workers, and D1 enabled.
-   `wrangler` CLI installed and configured.
-   A deployed D1 database (from `001-d1-database-schema` feature), including `CampSettings` table.
-   Access to a transactional email service (e.g., Resend, Brevo) configured with your Cloudflare Workers project.
-   An API authentication token (Bearer token) for internal API calls (`/api/registration/invite`).

## 1. Deploying the Frontend (Cloudflare Pages)

The frontend for the registration page (`GET /registration/:token`) is a Next.js application designed for Cloudflare Pages.

1.  **Frontend Project Setup**:
    *   Ensure your Next.js project (`frontend/`) is configured for deployment on Cloudflare Pages (e.g., `frontend/wrangler.toml` if separate, or integrated build process).
    *   The registration page will likely reside at `frontend/src/pages/registration/[token].tsx`.

2.  **Deploy Frontend**: Deploy your frontend project:
    ```bash
    wrangler pages deploy frontend/
    ```
    Note the deployed URL (e.g., `https://your-app.pages.dev`).

## 2. Deploying the Backend APIs and Scheduled Worker (Cloudflare Workers)

The backend consists of APIs (`POST /api/registration/invite`, `POST /api/registration/submit`) and a Scheduled Worker (`reminder_scheduler.ts`).

1.  **Worker Project Setup**:
    *   Ensure your Workers project (`backend/src/`) is configured.
    *   Your `wrangler.toml` for the backend Worker should include bindings for D1 and potentially for your transactional email service.
    ```toml
    # wrangler.toml example (for backend Worker)
    name = "registration-reminders-api"
    main = "backend/src/index.ts" # Or where your main Worker logic resides
    compatibility_date = "2024-01-01"

    [vars]
    INTERNAL_API_AUTH_TOKEN = "<YOUR_SECRET_AUTH_TOKEN>" # For /api/registration/invite

    [[d1_databases]]
    binding = "DB"
    database_name = "ciha-swedish-camp-db"
    database_id = "<YOUR_D1_DATABASE_ID>"

    # Example for Scheduled Worker configuration
    [[triggers.cron]]
    crons = ["0 * * * *"] # Run every hour
    ```

2.  **Deploy Backend Worker**: Deploy your backend Worker:
    ```bash
    wrangler deploy
    ```
    Note the deployed URL (e.g., `https://your-worker.workers.dev`).

## 3. Triggering an Invitation Email

To initiate the registration flow, you need to send an invitation for a `Purchase`. This typically requires an existing `Purchase` record in your D1 database.

1.  **Prepare a Purchase**: Ensure you have a `Purchase` record (e.g., from the Email Ingestion API or a seeding script) in your D1 database with `registration_state` = 'uninvited'.

2.  **Send Invite via API**: Use `curl` or an HTTP client to call the `/api/registration/invite` endpoint:
    ```bash
    curl -X POST "https://<YOUR_WORKER_SUBDOMAIN>.workers.dev/api/registration/invite" 
         -H "Content-Type: application/json" 
         -H "Authorization: Bearer <INTERNAL_API_AUTH_TOKEN>" 
         -d '{ "purchaseId": 123 }'
    ```
    Replace `<YOUR_WORKER_SUBDOMAIN>` and `<INTERNAL_API_AUTH_TOKEN>`. A `Reminder` record will be created in D1 and an email will be sent containing the magic link.

## 4. Completing the Registration Flow

1.  **Access Magic Link**: Retrieve the magic link from the invitation email (it will point to your Pages frontend, e.g., `https://your-app.pages.dev/registration/<TOKEN>`).
2.  **Fill and Submit Form**: Access the link, fill out the player details and kit orders on the registration page, and submit the form. The frontend will call `POST /api/registration/submit`.
3.  **Verify Completion**: Check your D1 database to ensure `Player`, `Registration`, and `KitOrders` records are created, and `Purchase.registration_state` is 'completed'.

## 5. Configuring and Verifying Reminders

1.  **Configure CampSettings**: Insert a record into your `CampSettings` table in D1 to define reminder cadence and limits for a specific `Camp`.
    ```sql
    INSERT INTO CampSettings (camp_id, reminder_cadence_days, max_reminders) VALUES (1, 'P3D,P7D', 2);
    ```
2.  **Monitor Scheduled Worker**: Ensure your `reminder_scheduler.ts` Worker is deployed with a Cron Trigger.
3.  **Verify Reminders**: For `Purchase` records with `registration_state` = 'invited' that meet the reminder criteria, observe that new `Reminder` records are created and emails are sent by the scheduled Worker. Monitor your email service logs.
