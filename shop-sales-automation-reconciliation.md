# Sales Data Reconciliation Feature Plan

## Goal
Create an admin tool to upload WooCommerce/Shop sales CSVs, clean the data to identify camp purchases via SKU, diff against existing database records to find discrepancies, and allow bulk-importing missing guardians/purchases with automated email triggers.

## Tasks

- [ ] **Task 1: Create CSV Parsing Utility**
  - Implement a CSV parser in standard Typescript or using `papaparse` to extract rows from the `ORDER#...export.csv` format format. Filter by relevant SKUs (e.g. `HCS-`).
  - *Verify:* Unit test or simple script to parse the provided test CSV and output valid JSON arrays.

- [ ] **Task 2: Create Reconciliation API (`POST /api/admin/reconciliation/parse`)**
  - Accept form-data containing the CSV file.
  - Parse the file and map rows to Camp products (`HCS-KEMPE`, `HCS-NYLANDER`, etc).
  - Extract the `Order Status` field (e.g. `CLOSED`, `PROBLEM`, `OPEN`).
  - Query `Purchases` and `Guardians` to see if a matching email + camp exists.
  - Return JSON with `missing` (discrepancies) and `existing` (matches), including the `OrderStatus`.
  - *Verify:* Use Postman/cURL with the test CSV; confirm it returns the expected JSON structure.

- [ ] **Task 3: Create Reconciliation UI Page (`/admin/reconciliation`)**
  - Build a page with a file upload dropzone.
  - Display the `missing` discrepancies in a data table.
  - **Crucially: Emphasize rows where `Order Status` is `PROBLEM` (e.g., with a warning badge or color) so the admin knows there's a payment/order issue.**
  - Add row selection logic (checkboxes + "Select All").
  - *Verify:* Upload CSV in the browser, verify the table populates and row selection state updates correctly.

- [ ] **Task 4: Create Processing API (`POST /api/admin/reconciliation/process`)**
  - Accept an array of selected missing records.
  - For each record, use existing `createPurchaseTransactions` logic (or adapted logic) to insert into `Guardians` and `Purchases`.
  - **Handling `PROBLEM` orders WITHOUT schema changes:**
    - *Option A (Recommended): Append to `raw_email_id`.* The `raw_email_id` field in the `Purchases` table is a string currently used to store the email reference. We can safely format the ID for manually imported PROBLEM orders like this: `[PROBLEM_ORDER]_csv_import_<timestamp>_<order_id>`. This is safe, requires no DB changes, and is easily searchable for reporting.
    - *Option B: Use the `registration_data` JSON field (if unused prior to registration).* By default, `registration_data` is null until the guardian completes the form. We *could* seed it with a JSON object like `{"import_status": "PROBLEM"}`, but this might get overwritten when they actually register.
    - *Decision:* We will use **Option A**. The UI and backend will look for the `[PROBLEM_ORDER]` substring in `raw_email_id` to flag it visually to admins across the system.
  - Trigger `email-service` to send the initial registration invitation email to the newly imported guardians.
  - *Verify:* Send a test payload to the API; confirm DB insertions and email dispatch logs.

- [ ] **Task 5: Connect UI to Processing API**
  - Add "Import Selected" button to the UI.
  - On success, refetch/re-parse or remove imported rows from the UI.
  - *Verify:* Perform a full end-to-end test with a dummy row in the UI, confirm success toast and UI update.

## Done When
- [ ] Admin can upload a `.csv` shop export.
- [ ] System accurately identifies records not already in the `Purchases` DB.
- [ ] Admin can select records and import them.
- [ ] Rows with an `Order Status` of `PROBLEM` are clearly highlighted in the UI.
- [ ] Records imported with `PROBLEM` status are visibly flagged in the resulting registration/purchases.
- [ ] Imported records trigger the standard camp invitation email.
