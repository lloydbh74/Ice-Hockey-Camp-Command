-- Migration number: 0001 	 2026-02-05T16:45:00Z
-- Feature: 001-d1-database-schema

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

-- Stores reusable form templates (Dynamic Form Builder).
CREATE TABLE FormTemplates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    schema_json TEXT NOT NULL, -- The JSON structure of the form
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Stores live forms associated with products.
CREATE TABLE Forms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    schema_json TEXT NOT NULL, -- The specific schema for this product
    is_active INTEGER DEFAULT 1,
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
-- UPDATED: Uses JSON for dynamic form responses.
CREATE TABLE Registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    purchase_id INTEGER NOT NULL,
    player_id INTEGER NOT NULL,
    form_id INTEGER NOT NULL, -- Link to the specific form version used
    registration_timestamp TEXT NOT NULL,
    form_response_json TEXT NOT NULL, -- Stores all custom fields (Medical, Consents, etc.)
    FOREIGN KEY (purchase_id) REFERENCES Purchases(id),
    FOREIGN KEY (player_id) REFERENCES Players(id),
    FOREIGN KEY (form_id) REFERENCES Forms(id)
);

-- Stores kit orders associated with a registration.
-- Kept as separate table for easy aggregation, though data also exists in JSON.
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

-- Camp-specific settings for reminders and other logic.
CREATE TABLE CampSettings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    camp_id INTEGER NOT NULL UNIQUE,
    reminders_enabled INTEGER DEFAULT 1,
    reminder_cadence_days INTEGER DEFAULT 7,
    max_reminders INTEGER DEFAULT 3,
    FOREIGN KEY (camp_id) REFERENCES Camps(id)
);

-- Global system configuration (e.g., admin emails).
-- Key-Value store for flexibility.
CREATE TABLE SystemSettings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
