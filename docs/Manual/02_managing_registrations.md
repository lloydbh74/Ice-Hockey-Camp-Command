# 2.1 Managing Registrations

## Overview
**Function:** The Registrations page is the central hub for viewing and managing all camp attendees across the entire system.

## Viewing and Filtering Players
**Action:** 
1. Navigate to **Registrations** on the left menu.
2. Use the **Camp Filter** dropdown to view players for a specific event (e.g., "Swedish Hockey Camp 2026").
3. Use the **Search Bar** to find specific players by their name or their guardian's email.
4. Click the **Pencil icon** (Edit) on any row to open the registration details and view or change the full answers they submitted on their form.

**Impact:** Allows you to quickly locate a player's record to answer parent queries or check medical flags.

## Editing a Registration
**Action:**
1. Locate the player in the Registrations list.
2. Click the **Pencil icon** (Edit) on their row.
3. Edit their details (like fixing a typo in their name or updating their jersey size).
4. Click **Save Changes**.

**Impact:** Ensures the data coaches see on the ice is perfectly accurate, even if the parent made a mistake during signup.

## Transferring (Moving) a Player
**Function:** Safely moves a player from one product (e.g. "Player Session") to another (e.g. "Goalie Session") while automatically preserving their medical and form data.

**Action:**
1. Locate the player and click the **Transfer arrow icon** (Move Stream/Product).
2. Select the new Product or Sub-camp they should be moved to.
3. A Smart Form Mapping window will appear. It will automatically copy over any matching answers (like dates of birth or medical info) to the new form requirements.
4. Review the auto-mapped fields, and provide any newly required information manually.
5. Click **Confirm Migration**.

```mermaid
graph TD
    A[Admin Initiates Transfer] --> B{Selects Target Product}
    B --> C[System analyzes Old Form vs New Form]
    C --> D{Are there matching questions?}
    D -- Yes --> E[Auto-fill matching answers<br>(e.g., DOB, Medical)]
    D -- No --> F[Leave fields blank]
    E --> G[Admin reviews mapped data]
    F --> G
    G --> H[Admin fills missing required fields]
    H --> I[Confirm Migration]
    I --> J[Player safely moved to new stream]
```

**Impact:** Seamlessly moves players between different groups without forcing parents to fill out the 30-question medical form all over again, ensuring zero data loss.

## Manually Chasing Incomplete Forms
**Action:**
1. Filter the list to show forms with the status **"Form Not Completed"** (marked in amber).
2. Click the **Envelope icon** (Chase) next to the player's name.
3. The system will immediately dispatch a customized email reminding the parent to complete the required medical information.

**Impact:** Proactively ensures all critical health and safety data is collected before the child steps on the ice.

## Deleting a Registration
**Action:**
1. Locate the player and click the **Trash Can icon** (Delete).
2. Type `DELETE` in the confirmation box and manually confirm via button.

**Impact:** **CAUTION!** This permanently removes the player's record, form answers, and history from Camp Command. This does *not* automatically refund their purchase in your external shop (that must be done separately).
