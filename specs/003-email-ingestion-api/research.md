# Research for Email Ingestion API Implementation Plan

## Consolidated Findings

### Decision: Performance Goals

-   **Rationale**: Cloudflare Workers with D1 are designed for high-performance edge computing, but specific metrics for idempotent APIs depend on implementation and underlying D1 performance.
-   **Key Findings**:
    *   **Latency**: D1 requests via Workers API show significant latency improvements (up to 60% end-to-end), especially for cross-region requests. D1 REST API requests can see 50-500ms improvements.
    *   **Throughput**: D1 exhibits faster writes (6.8x to 11x faster) compared to older versions. Performance of idempotent APIs relies on efficient implementation (e.g., unique keys for lookup, batch operations) and D1 query performance.
    *   **Metrics**: D1 exposes query volume, query latency, and storage size analytics for monitoring.
-   **Specific Metrics (NEEDS FURTHER DEFINITION)**:
    *   Target average API response time (e.g., < 200ms for 95th percentile).
    *   Target messages per second (TPS) for ingestion endpoint.
-   **Alternatives considered**: None (describes inherent Cloudflare/D1 performance).

### Decision: Constraints

-   **Rationale**: Understanding Cloudflare Workers and D1 operational limits is critical for designing a robust and scalable idempotent email ingestion API.
-   **Key Findings**:
    *   **Idempotency Implementation**: D1 operates in auto-commit mode; native SQL transactions don't span multiple requests. `D1Database::batch` provides transactional guarantees for sequential statements. Complex idempotent operations require application-level design (e.g., preconditions within batched statements to prevent re-processing, or leveraging Durable Objects for state management if multi-step transactions are needed).
    *   **D1 Operational Limits**:
        *   Database Size: 10 GB (paid) / 500 MB (free) per database. Sharding is recommended for data exceeding 10GB.
        *   Simultaneous Connections: Up to 6 concurrent D1 connections per Worker invocation.
        *   Worker CPU/Memory Limits: Standard Cloudflare Worker CPU (10ms Free, 5min Paid) and memory (128MB) limits apply, impacting complex processing per request.
    *   **n8n Integration Constraints**:
        *   Cloudflare Workers Request Body Size limits (e.g., 100 MB for Free/Pro plans, 500 MB for Enterprise) can affect the size of ingested email payloads.
        *   URL (16KB) and Header (128KB) limits apply to requests.
        *   n8n workflow execution timeouts (30s) and memory limits should be considered for upstream processing.
        *   Ensuring secure API access (e.g., Bearer tokens) and managing n8n's API rate limits are important.
-   **Alternatives considered**: None (these are inherent platform constraints).

### Decision: Scale/Scope Metrics

-   **Rationale**: Defining expected scale helps in designing for resilience and capacity on Cloudflare Workers.
-   **Key Findings**:
    *   **Emails per Day**: Directly tied to Worker request limits: 100,000 requests/emails per day on Free tier, effectively unlimited on Paid tier.
    *   **Concurrent Requests**: Cloudflare's network supports high volumes (average 4.5M req/s). Individual Worker invocations can handle 6 simultaneous outgoing connections (subrequests). The system must gracefully handle peak concurrent ingestion requests without D1 database overload.
    *   **CPU Time**: The API logic must be efficient to stay within Worker CPU limits (10ms Free, 5min Paid).
    *   **Message Size**: Email Routing limits messages (including attachments) to 25 MiB.
-   **Quantitative Targets (NEEDS FURTHER REFINEMENT FROM PRODUCT/BUSINESS)**:
    *   Average/Peak emails ingested per day: NEEDS CLARIFICATION (e.g., 1k, 10k, 100k+).
    *   Expected maximum concurrent ingestion requests: NEEDS CLARIFICATION (e.g., 10, 100, 1000+).
-   **Alternatives considered**: Other serverless platforms or traditional VMs, but this would deviate from the Cloudflare-native stack principle.