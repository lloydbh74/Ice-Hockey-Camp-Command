# 3.2 Ingestion Logs

## Overview
**Function:** Ingestion Logs provide an audit trail of the automated system that reads emails from your shop and tries to automatically create player records.

## Monitoring System Health
**Action:**
1. Navigate to **Ingestion Logs** on the left menu.
2. Review the list of recent ingestion attempts.
3. Check the **Status** column:
   - **Success (Green):** The email was read, and a record was successfully created.
   - **Failed (Red):** The system encountered an error (e.g., the email was malformed, or the product wasn't recognized).
4. Click the arrow to view the full details of any Failed log to see exactly why it didn't work.

**Impact:** Serves as an early warning system for your automation. If the automated link between your shop's emails and Camp Command breaks, you will see it here immediately, allowing you to manually intervene using the Reconciliation tool before parents complain.
