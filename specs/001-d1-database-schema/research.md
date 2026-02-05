# Research for D1 Database Schema Implementation Plan

## Consolidated Findings

### Decision: Performance Goals

-   **Rationale**: Cloudflare D1 is designed for high-performance edge applications, prioritizing low-latency reads and horizontal scalability.
-   **Key Findings**:
    *   Read queries (with proper indexing) typically execute in less than 1 millisecond.
    *   Write queries, which involve durable persistence, usually take several milliseconds.
    *   Throughput can reach approximately 1,000 queries per second for 1-millisecond queries, dropping to around 10 queries per second for 100-millisecond queries, given D1's single-threaded nature per database.
    *   Read replication serves read requests from the geographically closest replica, significantly reducing latency for distributed users.
    *   Real-world overall API call latencies can range from 200ms to over 500ms, depending on factors like Worker location relative to the D1 database and caching.
-   **Alternatives considered**: None (this describes D1's inherent performance characteristics).

### Decision: Constraints

-   **Rationale**: Understanding D1's limitations is crucial for designing a robust and scalable database schema and overall system architecture.
-   **Key Findings**:
    *   **Database Size Limit**: Each D1 database is capped at 10 GB for paid plans (500 MB for free plans). This cannot be increased for a single database, necessitating sharding for larger datasets (e.g., per-tenant, per-user, or per-camp).
    *   **Account Storage Limit**: 1 TB for paid plans (5 GB for free).
    *   **Processing Model**: D1 databases are single-threaded, processing queries sequentially. Overloaded databases will queue requests.
    *   **Row/Column Limits**: Maximum row/string/BLOB size is 2 MB. A table can have a maximum of 100 columns.
    *   **SQL Statement Limits**: Max SQL statement length is 100 KB, and max 100 bound parameters per query.
    *   **Query Duration**: Maximum SQL query duration is 30 seconds.
    *   **Worker Invocation Queries**: Up to 1000 queries per Worker invocation for paid plans (50 for free).
    *   **Geographic Distribution**: While read replicas are global, the primary D1 database is hosted in a single data center, impacting write latency from distant Workers.
    *   **Transactional Consistency**: D1 (based on SQLite) does not support native ACID transactions in the traditional sense, meaning only one write transaction can be open at a time. Complex, multi-step write operations require careful architectural design to ensure consistency (e.g., idempotent operations, batching, compensating transactions).
-   **Alternatives considered**: None (these are D1's inherent constraints).

### Decision: Scale/Scope Metrics

-   **Rationale**: Defining quantitative scale expectations ensures the database design can accommodate projected growth for the specific use cases.
-   **Key Findings**:
    *   **Multiple Camps**: D1 is well-suited, especially by leveraging multiple smaller databases (up to 50,000 per paid account) or carefully sharding data within a single 10GB database if the total data volume per camp is small.
    *   **Player Registrations**: D1 can manage relational data effectively. For high-volume concurrent registrations, the single-threaded nature of a D1 database suggests using strategies like queues (e.g., Cloudflare Queues) to buffer and process registrations to avoid overloading.
    *   **Product Orders**: This use case often requires strong transactional consistency. D1's transactional limitations (single open write transaction) mean that complex order workflows (e.g., inventory deduction, payment processing, order status updates) would need custom logic for consistency, idempotency, and potential rollback mechanisms. Batching operations is crucial. For large product catalogs or very high order volumes, sharding might be necessary due to the 10GB database limit.
    *   **Reminder Systems**: D1's read replication is beneficial for fetching reminders. Write performance for scheduling reminders is acceptable, but for asynchronous, guaranteed delivery of reminders, Cloudflare Queues is a strong complementary service.
-   **Quantitative Targets (NEEDS FURTHER REFINEMENT FROM PRODUCT/BUSINESS)**:
    *   Number of concurrent camps: NEEDS CLARIFICATION (e.g., 5-10, 50-100, 1000+)
    *   Peak player registrations per hour/day: NEEDS CLARIFICATION (e.g., 100, 1000, 10000+)
    *   Total number of player records: NEEDS CLARIFICATION (e.g., 10k, 100k, 1M+)
    *   Total number of product orders per year: NEEDS CLARIFICATION (e.g., 1k, 10k, 100k+)
    *   Reminder emails sent per day: NEEDS CLARIFICATION (e.g., 500, 5000, 50000+)
-   **Alternatives considered**: Traditional relational databases (e.g., PostgreSQL, MySQL) for stronger transactional guarantees, but these would deviate from the Cloudflare-native stack principle.