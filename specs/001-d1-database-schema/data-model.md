# Data Model: D1 Database Schema

This document details the database schema for the Swedish Camp Command application, designed for Cloudflare D1. It defines the entities, their attributes, and relationships, fulfilling the requirements for managing camps, players, registrations, purchases, and reminders.

## Entities and Relationships

The core entities are:

-   **Camps**: Defines the main camp programs (e.g., "Hat-Trick Heroes 2026").
-   **Products**: Stores sellable items, like a specific camp attendance.
-   **CampProducts**: Links `Products` to `Camps`, defining what's for sale for a given camp.
-   **Guardians**: Stores parent/guardian information, primarily their email.
-   **Players**: Stores individual player's core information, linked to a `Guardian`.
-   **Purchases**: Represents the initial record created from a parsed email. This is the source of truth for the registration workflow and tracks the `registration_state`.
-   **Registrations**: Central table linking a player to a purchase, created when the guardian fills the form.
-   **KitOrders**: Stores kit orders associated with a `Registration`.
-   **Reminders**: Tracks reminder emails sent for incomplete registrations, including a magic link token.

Relationships are enforced via `FOREIGN KEY` constraints.

## SQL Schema Definition

Below are the SQL `CREATE TABLE` statements that define the D1 database schema:

```sql
-- Stores the main camp programs (e.g., "Hat-Trick Heroes 2026").
CREATE TABLE Camps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    year INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Stores sellable items, like a specific camp attendance.
CREATE TABLE Products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE, -- e.g., 'Hat-Trick Heroes', 'Short Sticks'
    description TEXT
);

-- Links Products to Camps, defining what's for sale for a given camp.
CREATE TABLE CampProducts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    camp_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    price REAL,
    FOREIGN KEY (camp_id) REFERENCES Camps(id),
    FOREIGN KEY (product_id) REFERENCES Products(id)
);

-- Stores the parent/guardian who makes a purchase.
CREATE TABLE Guardians (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT
);

-- Represents the initial record created from a parsed email. This is the source of truth for the registration workflow.
CREATE TABLE Purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guardian_id INTEGER NOT NULL,
    camp_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    registration_state TEXT NOT NULL DEFAULT 'uninvited', -- uninvited, invited, in_progress, completed
    purchase_timestamp TEXT,
    raw_email_id TEXT, -- Identifier for the source email
    FOREIGN KEY (guardian_id) REFERENCES Guardians(id),
    FOREIGN KEY (camp_id) REFERENCES Camps(id),
    FOREIGN KEY (product_id) REFERENCES Products(id)
);

-- Stores individual player's core information.
CREATE TABLE Players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guardian_id INTEGER NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    sex TEXT,
    FOREIGN KEY (guardian_id) REFERENCES Guardians(id)
);

-- Central table linking a player to a purchase, created when the guardian fills the form.
CREATE TABLE Registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    purchase_id INTEGER NOT NULL,
    player_id INTEGER NOT NULL,
    registration_timestamp TEXT NOT NULL,
    club TEXT,
    playing_age_group TEXT,
    playing_experience TEXT,
    playing_position TEXT,
    -- Medical and consent details follow
    medical_notes TEXT,
    consent_photo_video INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (purchase_id) REFERENCES Purchases(id),
    FOREIGN KEY (player_id) REFERENCES Players(id)
);

-- Stores kit orders associated with a registration.
CREATE TABLE KitOrders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registration_id INTEGER NOT NULL,
    item_type TEXT NOT NULL, -- 'jersey' or 't-shirt'
    size TEXT NOT NULL,
    personalization_name TEXT,
    personalization_number TEXT,
    FOREIGN KEY (registration_id) REFERENCES Registrations(id)
);

-- Tracks reminder emails sent for incomplete registrations.
CREATE TABLE Reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    purchase_id INTEGER NOT NULL,
    sent_at TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE, -- The unique part of the magic link
    expires_at TEXT NOT NULL,
    FOREIGN KEY (purchase_id) REFERENCES Purchases(id)
);
```

## Validation Rules and State Transitions

### Validation Rules (from `NOT NULL` and `UNIQUE` constraints)

-   `Camps.name` and `Camps.year` must not be NULL.
-   `Products.name` must not be NULL and must be unique.
-   `CampProducts.camp_id` and `CampProducts.product_id` must not be NULL.
-   `Guardians.email` must not be NULL and must be unique.
-   `Purchases.guardian_id`, `Purchases.camp_id`, `Purchases.product_id`, `Purchases.quantity`, and `Purchases.registration_state` must not be NULL.
-   `Players.guardian_id`, `Players.first_name`, `Players.last_name`, and `Players.date_of_birth` must not be NULL.
-   `Registrations.purchase_id`, `Registrations.player_id`, `Registrations.registration_timestamp`, and `Registrations.consent_photo_video` must not be NULL.
-   `KitOrders.registration_id`, `KitOrders.item_type`, and `KitOrders.size` must not be NULL.
-   `Reminders.purchase_id`, `Reminders.sent_at`, `Reminders.token`, and `Reminders.expires_at` must not be NULL.
-   `Reminders.token` must be unique.

### State Transitions (for `Purchases.registration_state`)

The `registration_state` in the `Purchases` table (`uninvited`, `invited`, `in_progress`, `completed`) implies a workflow:

1.  **`uninvited`**: Initial state after a purchase is parsed from an email. No registration form has been sent or started.
2.  **`invited`**: A reminder/magic link has been sent to the guardian to complete registration.
3.  **`in_progress`**: The guardian has started the registration form but has not yet submitted it. (This state might require application-level logic rather than direct DB enforcement).
4.  **`completed`**: The registration form has been successfully submitted and a `Registrations` record created.
