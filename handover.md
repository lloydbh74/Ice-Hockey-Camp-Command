# Swedish Camp Command - Project Handover Document

## 1. Project Overview
The Swedish Camp Command is a modern Ice Hockey Camp Management System designed to handle camp registrations, player data, kit orders, and daily operations. 

It aims to provide an efficient and friction-free experience for three main user groups:
- **Organisers**: Need efficient administration, oversight, and tools like attendance tracking and kit ordering.
- **Guardians (Parents)**: Require a smooth registration process for their players, utilizing a passwordless "Magic Link" access.
- **Coaches**: Need quick access to daily schedules and player streams.

## 2. Repositories and Locations
- **Local Development Folder:** `c:\Users\lloyd\Sync\Swedish Camp Command`
- **Remote Repository:** `lloydbh74/Ice-Hockey-Camp-Command` (GitHub/Gitlab)

## 3. Technology Stack & Infrastructure
- **Hosting/Runtime Environment:** Cloudflare (configured via `wrangler.toml` for `swedish-camp-command`).
- **Database:** Cloudflare D1 (`swedish-camp-db`, ID: `17e1e9bd-f623-4a17-864a-e64dc25fcc8e`).
- **Frontend/Web:** Web application output directed to `web/.vercel/output/static`.
- **API/Automation:** n8n is used for webhooks and email ingestion (e.g., parsing purchase emails).

## 4. Key Features & Workflows

### 4.1 Purchase & Ingestion
- **Trigger:** A guardian purchases a camp spot via a public WooCommerce/Shop webshop.
- **Process:** The system intercepts the order confirmation email via n8n. The Ingestion API creates a `Guardian` record (if new) and a `Purchase` record with an `uninvited` status.
- **Reconciliation Tool:** An admin tool allows manual uploading of WooCommerce/Shop CSVs to find missing purchases, flag `PROBLEM` orders, and bulk-import them. Problem orders are flagged by appending `[PROBLEM_ORDER]` to the `raw_email_id`.

### 4.2 Invitation & Registration
- **Invitation Engine:** Periodically checks for `uninvited` purchases, generates a Magic Link, emails the Guardian, and updates status to `invited`.
- **Registration Form:** A dynamic form builder lets organisers customize medical questions and sizing charts. Guardians complete this form password-free, providing player details (DOB, position, medical info) and kit orders.
- **Reminders:** The system automatically chases incomplete registrations based on camp-specific settings (e.g., after 3 days, 7 days).

### 4.3 Camp Management
- **Dashboard:** Organisers manage camps, link products, and view real-time statistics (purchases, registrations).
- **Kit Orders:** Aggregated views of required merchandise that can be exported for suppliers.
- **Day Planner:** A drag-and-drop schedule manager to assign sessions (e.g., "On-Ice Skills") to specific streams/groups. Coaches access a read-only view of this schedule.

## 5. Design System (Scandic-Precision)
The UI follows a "Scandic-Precision meets On-Ice Intensity" theme, aiming for a clean, minimalist, and professional look.
- **Colors:** Nordic Midnight (`#0F172A`), Glacier Blue (`#E0F2FE`), Ice White (`#FFFFFF`). Functional colors include Victory Gold (CTAs) and Penalty Red (Errors).
- **Typography:** `Inter` or `Roboto`. Bold for headings, Monospaced for tabular data.
- **Layout:** 12-column grid for data-dense admin views, centered single-column for low-density guardian registration forms.

## 6. Directory Structure
Key folders and files for a specialist taking over:
- `specs/`: Core technical documentation organized sequentially.
  - `001-d1-database-schema`
  - `002-camp-and-system-management`
  - `003-email-ingestion-api`
  - `004-registration-and-reminders`
  - `005-organiser-dashboards-and-reports`
  - `006-camp-day-planner`
- `web/`: Frontend application code.
- `migrations/`: D1 database migrations.
- `wrangler.toml`: Cloudflare configuration file.
- `DESIGN.md`: Comprehensive design tokens and component styling rules.
- `shop-sales-automation-reconciliation.md`: Plan for the manual CSV reconciliation tool.
- `user_story.md`: Detailed narrative of the end-to-end user experience.
- `README.md`: General project introduction.

## 7. Immediate Next Steps / Ongoing Tasks
- Build out local development instructions in the `README.md`.
- Implementation of the `Sales Data Reconciliation Feature` as per the plan in `shop-sales-automation-reconciliation.md`.
- Establish the automated email parser logic using n8n to connect webshop orders with the D1 database.
