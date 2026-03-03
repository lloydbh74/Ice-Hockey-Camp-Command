# ADR-004: GDPR-Compliant Camp Archiving Strategy

## Status
Proposed

## Context
When a camp concludes, the academy (Data Controller) must shift from operational data processing to historical data retention. The academy holds sensitive "Special Category Data" (medical, dietary) under GDPR, which cannot be kept indefinitely without a valid operational reason. However, the academy also needs to retain financial data (purchases) for statutory periods (e.g., 7 years) and desires anonymized aggregate data (e.g., jersey size distributions) for future business forecasting.
The current system retains all data indefinitely and does not differentiate between active operational views and historical records.

## Decision
We will implement a **Phased "Hybrid" Archive Strategy**:
1. **Contextual UI Separation**: Create distinct "Active" and "Archived" tabs in the Admin Dashboard for Camps, Products, and Registrations.
2. **Pre-Purge Aggregation**: Before sensitive data is destroyed, aggregate generic metrics (e.g., jersey sizes) into a static summary report saved to the camp record.
3. **Targeted Data Purge**: Introduce a "Purge Sensitive Data" action for Archived camps that explicitly NULLs the `form_response_json` column in the `Registrations` table. 
4. **Financial Retention**: Leave the `Purchases`, generic `CampProducts`, and `Forms` intact indefinitely for accounting compliance.

## Rationale
This approach strictly adheres to GDPR's Data Minimization and Purpose Limitation principles by permanently destroying sensitive personal medical data once the camp is over. Simultaneously, it protects the academy's business interests by preserving required financial records and extracting valuable planning metrics (aggregation) before the raw data is erased. Separating the UI into Active/Archived tabs ensures daily workflows remain uncluttered.

## Trade-offs
- **Loss of granular historical data**: We can no longer look back at exactly which specific player ordered a specific jersey or meal previously.
- **Increased UI/API Complexity**: Requires separate API logic for the purge action and potentially building a pre-purge aggregation tool.

## Consequences
- **Positive**: Complete GDPR compliance regarding sensitive data retention. Cleaner operational UI for staff. Safe long-term retention of financial data.
- **Negative**: Risk of accidental premature purging if an admin clicks the button too early (mitigated by strict confirmation dialogs).
- **Mitigation**: Add warning modals and ensure the "Purge" action is only available for camps explicitly marked as "Archived."
