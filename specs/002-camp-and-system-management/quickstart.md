# Quickstart: Camp and Settings Management

This guide provides a quick overview for organisers on how to access and utilize the Camp and Settings Management features within the admin UI.

## 1. Accessing the Admin Settings

Access to the organiser admin settings is part of the overall admin dashboard, secured via magic links (as per the system's authentication strategy).

1.  **Login**: Use your secure magic link to log into the admin dashboard.
2.  **Navigate to Settings**: Once logged in, navigate to `/admin/settings`. You should see sections for managing Camps, Products, and Reminder settings.

## 2. Managing Camps

Organisers can create, view, update, and deactivate camps.

### 2.1. Creating a New Camp

1.  **Go to Camps Settings**: Navigate to the `/admin/settings/camps` page.
2.  **Fill out Form**: Locate the "Create New Camp" form (likely at the top or a dedicated section). Enter the camp's name, year, and any other required details.
3.  **Submit**: Submit the form. A new `Camp` record will be created and appear in the list.

### 2.2. Viewing and Updating a Camp

1.  **Select a Camp**: From the list on the `/admin/settings/camps` page, select the camp you wish to view or edit.
2.  **Edit Details**: Modify the camp's details (e.g., name, year, etc.) in the provided form.
3.  **Save Changes**: Submit the form to save your updates.

### 2.3. Deactivating a Camp

1.  **Select a Camp**: On the `/admin/settings/camps` page, find the camp you want to deactivate.
2.  **Deactivate Action**: Locate the "Deactivate" or "Change Status" option.
3.  **Confirm**: Confirm the deactivation. The camp's status will change, preventing new purchases from being associated with it. If the camp has associated purchases, the system will prevent full deletion and instead suggest deactivation.

## 3. Managing Products

Organisers can create, view, and update generic product definitions.

### 3.1. Creating a New Product

1.  **Go to Products Settings**: Navigate to the `/admin/settings/products` page.
2.  **Fill out Form**: Enter the product's name, description, base price, and any other details.
3.  **Submit**: Submit the form. The new `Product` will be created and added to the list of available products.

### 3.2. Viewing and Updating a Product

1.  **Select a Product**: From the list on the `/admin/settings/products` page, select the product you wish to view or edit.
2.  **Edit Details**: Modify the product's details.
3.  **Save Changes**: Submit the form to save your updates. Note that changes to product prices will only apply to future `CampProduct` associations or purchases; they will not retroactively alter past `Purchase` records.

## 4. Associating Products with Camps (CampProducts)

This allows you to specify which products are available for which camps and at what price for that specific camp.

1.  **Go to Camp Product Settings**: Navigate to a specific camp's product settings page (e.g., `/admin/settings/camps/[campId]/products`).
2.  **Associate Product**: Select an existing `Product` from a list and specify the price for this `CampProduct` association.
3.  **Save**: The `CampProduct` record will be created.

## 5. Configuring Reminder Settings

Customise the automated reminder emails for each camp.

1.  **Go to Reminder Settings**: Navigate to the `/admin/settings/reminders` page, and select the specific `Camp` you wish to configure.
2.  **Update Settings**: Adjust the "Reminder Interval (days)" and "Max Reminders" as needed.
3.  **Save**: Save the changes. The system will use these new settings for future reminder runs for that camp.