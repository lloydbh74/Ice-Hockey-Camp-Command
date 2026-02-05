# Research for Registration Flow and Reminder Engine Implementation Plan

## Consolidated Findings

### Decision: Performance Goals

-   **Rationale**: Leveraging Cloudflare's edge platform (Pages, Workers, D1) for both frontend and backend operations is designed for low latency and high responsiveness.
-   **Key Findings**:
    *   **Frontend (React/Next.js on Cloudflare Pages)**: Next.js features (SSR, SSG, ISR) significantly improve initial page load times. Optimizations like image optimization, code splitting, and caching are crucial.
    *   **Backend (Hono on Cloudflare Workers)**: Hono is highly optimized for edge environments, contributing to low-latency API responses. Workers execute code close to users.
    *   **Transactional Email**: Metrics like Deliverability Rate, Open Rate, Click-Through Rate, and crucially, `Time to Inbox`, are vital. Cloudflare Workers' edge execution minimizes the latency of sending requests.
    *   **D1/Workers Interaction**: D1 requests via Workers API show up to 60% latency improvement. However, initial D1 queries can experience 250-800ms delays (D1 cold start). This needs to be considered for user-facing flows.
-   **Specific Metrics (NEEDS FURTHER DEFINITION)**:
    *   Target average registration page load time (e.g., < 2 seconds).
    *   Target API response time for registration submission (< 500ms for 95th percentile).
    *   Target reminder email `Time to Inbox` (e.g., < 5 minutes).
    *   Target reminder scheduled worker execution time (e.g., < 30 seconds for batch processing).
-   **Alternatives considered**: None (describes inherent platform performance characteristics).

### Decision: Constraints

-   **Rationale**: Understanding platform-specific constraints is crucial for designing a secure, reliable, and scalable registration and reminder system.
-   **Key Findings**:
    *   **Magic Links (Generation & Validation)**:
        *   **Generation**: Use cryptographically secure tokens (UUIDs, random bytes) generated in Workers. Tokens should have a short lifespan (e.g., 15-30 minutes) and be unique per request.
        *   **Storage**: Store token data (user ID/email, `expiresAt`, `used` flag) in Cloudflare KV. KV entry expiration should match token lifespan.
        *   **Validation**: Worker endpoint to validate token existence, expiration, and `used` flag (checking `used: false`).
        *   **Single-Use Enforcement**: Implement atomic update of `used` flag in KV from `false` to `true` immediately after validation. Set a very short expiration on this updated KV entry to ensure eventual consistency propagation while preventing immediate reuse. Generic error messages for failures.
    *   **Configurable Reminders**:
        *   Cadence and limits can be stored in D1 (e.g., `CampSettings` table).
        *   Scheduled Workers (Cron Triggers) are suitable for periodic execution.
    *   **Email Sending Reliability**:
        *   Use transactional email provider APIs (e.g., Resend, Brevo) from Workers.
        *   Implement robust error handling, logging, and retry logic with backoffs for email sending failures. Cloudflare Workflows or a custom retry mechanism within Workers can be used.
    *   **D1 Database Constraints**:
        *   Single-threaded processing per D1 database instance for writes (use `batch` for transactional guarantees for sequential statements).
        *   Database size limits (10GB/500MB per DB) may necessitate sharding if `CampSettings` or `Reminders` data for a single camp grows very large.
        *   D1 databases are region-specific, potentially incurring latency if Worker and D1 are geographically distant.
        *   D1 cold starts can add latency to the first query in a Worker invocation.
    *   **Worker Limits**: CPU time (10ms Free, 5min Paid), memory (128MB), 6 concurrent outgoing connections per Worker invocation.
-   **Alternatives considered**: None (these are inherent platform constraints and best practices).

### Decision: Scale/Scope Metrics

-   **Rationale**: Defining quantitative scale targets is essential for designing for capacity and ensuring the system meets business requirements.
-   **Key Findings**:
    *   **Concurrent Registrations**: Cloudflare Workers are built for high concurrency; the network handles millions of requests/second. A single Worker script can handle thousands of concurrent requests. Design should account for D1 interaction under peak load.
    *   **Scheduled Reminders**: Cloudflare Scheduled Workers (Cron Triggers) are ideal for periodic processing. Scalability depends on the number of active `Reminder` records and email sending throughput of the chosen provider.
    *   **Emails per Day**: Cloudflare Workers can send 100,000 emails/day (Free) or effectively unlimited (Paid).
    *   **CPU Time**: API logic and scheduled tasks must be efficient to stay within Worker CPU limits.
    *   **Message Size**: Email Routing limits messages (including attachments) to 25 MiB.
-   **Quantitative Targets (NEEDS FURTHER REFINEMENT FROM PRODUCT/BUSINESS)**:
    *   Peak concurrent registrations per hour/day: NEEDS CLARIFICATION (e.g., 10, 100, 1000+).
    *   Number of reminder emails processed per hour/day: NEEDS CLARIFICATION (e.g., 500, 5000, 50000+).
    *   Total number of active Purchases to manage for reminders: NEEDS CLARIFICATION (e.g., 1k, 10k, 100k+).
-   **Alternatives considered**: Other serverless platforms or traditional VMs, but this would deviate from the Cloudflare-native stack principle.