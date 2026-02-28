# Administrator Manual: Setting up "Hockey Camp Sweden"

## Overview
This manual provides step-by-step instructions for configuring a new multi-stream camp instance. In this guide, we will set up **"Hockey Camp Sweden"**, a specialized camp featuring five distinct participant groups separated by age and skill levels. 

By following this process, administrators will learn how to:
1. Define the five coaching streams in the **Product Repository**.
2. Create the overarching **Camp Container**.
3. Allocate and price the streams specifically for this camp.

## Prerequisites
* You must be logged into the **Administrator Dashboard**.
* Registration Form Templates must already be published if they require specific intake data (e.g., liability waivers, emergency contacts).

---

## Phase 1: Defining Global Products

Before a camp can accept registrations, its specific streams (products) must exist in the global repository. We will create five products: *Advanced Elite*, *Advanced Pro*, *Nylander Group*, *Kempe Group*, and *Adults Mixed*.

### Step-by-Step Instructions

1. Navigate to the **Product Repository** using the main sidebar (`/admin/settings/products`).
2. Click the **+ Define New Product** button in the top right corner. 
3. In the modal, fill out the details for the first product:
   * **Product Name**: `Advanced Elite (2008-2011)`
   * **Description**: `Dates: 23rd–25th August`
   * **Product SKU**: Provide a unique identifier, e.g., `HCS-ADV-ELITE`
   * **Base Price (GBP)**: Enter the standard price for this group.
   * **Registration Form**: Select the appropriate intake form for minors.
4. Click **Save Product**.
5. Repeat steps 2-4 for the remaining four groups:
   * **Advanced Pro (2011-2015)**: `Dates: 23rd–25th August` / SKU: `HCS-ADV-PRO`
   * **Nylander Group (2011-2017)**: `Dates: 26th–28th August` / SKU: `HCS-NYLANDER`
   * **Kempe Group (2014-2019)**: `Dates: 26th–28th August` / SKU: `HCS-KEMPE`
   * **Adults Mixed**: `Dates: 22nd August (3:30 pm registration). Recommended 1 year playing experience.` / SKU: `HCS-ADULT`

> [!TIP]
> Defining these products globally allows them to be reused and analyzed across different years or seasons without re-entering the data.

---

## Phase 2: Creating the Camp Container

The "Camp Container" is the parent entity that groups these specific products together under a single banner and season.

### Step-by-Step Instructions

1. Navigate to **Camp Management** using the sidebar (`/admin/settings/camps`).
2. Click the **+ Create New Camp** button.
3. In the modal dialog:
   * **Camp Name**: Enter `Hockey Camp Sweden`
   * **Year**: Ensure the current or upcoming season year is selected (e.g., `2024`).
4. Click the **Create Camp** button.
5. You will now see the new camp listed. It will be marked with a grey `DEACTIVATED` badge by default.

---

## Phase 3: Allocating Products to the Camp

Now that the camp exists, we must assign our newly created streams (products) to it.

### Step-by-Step Instructions

1. From the **Camp Management** page, locate "Hockey Camp Sweden" and click the dark **Edit Settings** button on its card.
2. In the **Camp Actions / Assigned Products** view, locate the **+ Add Product** button.
3. In the modal dialog:
   * Use the **Select Product** dropdown to find and select `Advanced Elite (2008-2011)`.
   * The system will automatically populate the base price. If you want to charge a different price specifically for this camp, update the **Override Camp Price (GBP)** field.
4. Click **Assign to Camp**.
5. Repeat steps 2-4 to assign the remaining four products (*Advanced Pro*, *Nylander Group*, *Kempe Group*, *Adults Mixed*).

> [!NOTE]
> All assigned products will now appear under the "Assigned Products" list. You can click the Edit (pencil) icon next to their prices to update them at any time.

---

## Phase 4: Activation & Verification

The final step is to make the camp live so that the registration system can process sign-ups for these specific streams.

### Step-by-Step Instructions

1. On the Camp Settings page (`/admin/settings/camps/[id]`), look at the header next to the camp name ("Hockey Camp Sweden").
2. Click the grey **Deactivated** badge.
3. The badge will turn green and display **Active**.
4. The setup is complete. You can now direct participants to the public registration link to select their preferred group.
