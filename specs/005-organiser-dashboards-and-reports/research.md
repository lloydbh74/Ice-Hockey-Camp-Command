# Research for Organiser Dashboards and Reports

## 1. Cloudflare R2 for CSV exports

- **Decision**: Cloudflare R2 will *not* be used for CSV exports. Exports will be generated on-the-fly and streamed directly to the client.
- **Rationale**: The functional requirements and user stories (FR-003, Acceptance Scenarios in US2 and US3) imply direct download of CSV files rather than persistent storage for later retrieval. Streaming directly from the API endpoint is simpler, more efficient, and avoids unnecessary complexity and cost for transient data.
- **Alternatives Considered**: Storing CSVs temporarily in R2. Rejected due to added complexity and cost for transient data without an explicit requirement for persistence or archival.

## 2. Specific Testing Frameworks

- **Decision**:
    - **Frontend (React/Next.js)**: Vitest for unit/component testing; Playwright for end-to-end testing.
    - **Backend (Hono/Cloudflare Workers)**: Vitest for unit/integration testing of Hono handlers and Workers logic.
- **Rationale**: Vitest offers excellent performance and seamless integration with TypeScript/ESM environments, making it a strong choice for both frontend (React) and backend (Hono/Workers) unit/integration testing. Playwright provides robust end-to-end testing capabilities for web applications, offering cross-browser support and a comprehensive API for browser automation, which is well-suited for ensuring the overall functionality of the dashboards and reports.
- **Alternatives Considered**:
    - **Frontend**: Jest (while common for React, Vitest often provides faster execution and better developer experience with modern setups like Vite/Next.js), Cypress (a good E2E framework, but Playwright offers more flexibility for various CI environments and complex scenarios).
    - **Backend**: Miniflare (useful for local Cloudflare Worker emulation, but Vitest can effectively wrap and execute Worker code for testing without needing a separate runner).