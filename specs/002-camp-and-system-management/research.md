# Research for Camp and Settings Management

This document summarizes key research and decisions made during the planning phase for the "Camp and Settings Management" feature. No explicit "NEEDS CLARIFICATION" items were identified in the Technical Context, as decisions largely align with established project conventions and technology stack.

## 1. Technology Stack and Development Practices

-   **Decision**: The feature will be built using the existing project's Cloudflare stack: React/Next.js for the frontend, Hono/Cloudflare Workers for the backend, and Cloudflare D1 for the database. Development will follow Test-Driven Development (TDD) principles.
-   **Rationale**: This aligns directly with the "Full-Stack Cloudflare & TDD" principle (Constitution VI) and promotes consistency across the project.
-   **Alternatives Considered**: None, as the project constitution mandates this stack.

## 2. Testing Frameworks

-   **Decision**: Vitest will be used for unit/component testing (frontend) and unit/integration testing (backend). Playwright will be used for end-to-end (E2E) testing (frontend).
-   **Rationale**: These frameworks have been established in previous features (e.g., `004-organiser-dashboards-and-reports`) and offer robust support for TypeScript, modern JavaScript development, and CI/CD environments.
-   **Alternatives Considered**: Jest, Cypress, Miniflare. Rejected in favor of consistency and established patterns.

## 3. Handling Deletion of Associated Entities (`Camp`, `Product`)

-   **Decision**: When an organiser attempts to delete a `Product` or `Camp` that has associated `Purchase` records, the system will prevent physical deletion and instead offer a "soft delete" or "archive" functionality. The UI will provide a warning message explaining that the entity is in use.
-   **Rationale**: This addresses the explicit edge case mentioned in `spec.md` and preserves data integrity. Physical deletion would lead to orphaned `Purchase` records or violate foreign key constraints. "Soft delete" allows entities to be marked as inactive without losing historical data, which is crucial for reporting and auditability.
-   **Alternatives Considered**: Cascading deletes (rejected due to data loss for historical `Purchase` records), hard deletion with prior data migration (rejected due to complexity and potential data inconsistencies).