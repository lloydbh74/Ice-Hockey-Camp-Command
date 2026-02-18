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
-- 0002_forms_and_templates.sql

-- Update Forms table to support versioning
-- We add 'version', 'changelog', 'is_published'
ALTER TABLE Forms ADD COLUMN version TEXT DEFAULT '1.0.0';
ALTER TABLE Forms ADD COLUMN changelog TEXT;
ALTER TABLE Forms ADD COLUMN is_published INTEGER DEFAULT 0;

-- Update FormTemplates to add description
ALTER TABLE FormTemplates ADD COLUMN description TEXT;
ALTER TABLE FormTemplates ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP;
-- 0003_form_history.sql

-- FormHistory: Archive of past form versions
CREATE TABLE FormHistory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    form_id INTEGER NOT NULL,
    version TEXT NOT NULL,
    schema_json TEXT NOT NULL,
    changelog TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (form_id) REFERENCES Forms(id) ON DELETE CASCADE
);

-- Index for fast history lookups
CREATE INDEX idx_form_history_form_id ON FormHistory(form_id);
-- Migration number: 0004 	 2026-02-06T16:20:00Z
-- Feature: 002-camp-and-system-management

-- Update Camps with status for archiving
ALTER TABLE Camps ADD COLUMN status TEXT DEFAULT 'active';
ALTER TABLE Camps ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP;

-- Update Products with status, base_price, and form_template_id
ALTER TABLE Products ADD COLUMN status TEXT DEFAULT 'active';
ALTER TABLE Products ADD COLUMN base_price REAL DEFAULT 0.0;
ALTER TABLE Products ADD COLUMN form_template_id INTEGER REFERENCES FormTemplates(id);
ALTER TABLE Products ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE Products ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP;

-- Update CampProducts with status
ALTER TABLE CampProducts ADD COLUMN status TEXT DEFAULT 'active';
ALTER TABLE CampProducts ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP;

-- Update Purchases to store price at time of purchase (Historical Immutability)
ALTER TABLE Purchases ADD COLUMN price_at_purchase REAL;
ALTER TABLE Purchases ADD COLUMN currency TEXT DEFAULT 'SEK'; -- Default currency for the camp
ALTER TABLE Purchases ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP;

-- Create an index for faster camp-product lookups
CREATE INDEX idx_camp_products_ids ON CampProducts (camp_id, product_id);
-- Migration number: 0005 	 2026-02-09T17:41:00Z
-- Feature: 003-email-ingestion-api

-- Add SKU column to Products table for reliable mapping with external order data
ALTER TABLE Products ADD COLUMN sku TEXT;

-- Create a unique index on SKU to prevent duplicates and ensure fast lookups
CREATE UNIQUE INDEX idx_products_sku ON Products (sku);
-- Migration number: 0006 	 2026-02-10T10:31:00Z
-- Feature: 003-email-ingestion-api-hardening

-- Create IngestionLogs table for audit trail
CREATE TABLE IF NOT EXISTS IngestionLogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    raw_email_id TEXT,
    status TEXT NOT NULL,
    message TEXT,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial ingestion token if not already unset
INSERT OR IGNORE INTO SystemSettings (key, value) VALUES ('ingestion_token', 'swedish-camp-ingest-2026');
-- Migration number: 0007 	 2026-02-10T14:40:00Z
-- Feature: 004-registration-flow

-- Add registration token and data storage to Purchases
ALTER TABLE Purchases ADD COLUMN registration_token TEXT;
ALTER TABLE Purchases ADD COLUMN registration_data TEXT; -- Stores form response JSON
CREATE UNIQUE INDEX idx_purchases_registration_token ON Purchases(registration_token);

-- Index for registration state lookups (useful for reminders)
CREATE INDEX idx_purchases_registration_state ON Purchases(registration_state);
-- Seed the default "Hockey Sweden Camp 3 Day Camp" template
INSERT INTO FormTemplates (name, description, schema_json)
VALUES (
    'Hockey Sweden Camp 3 Day Camp Registration',
    'Standard registration template matching the official camp registration form.',
    '[
        {"id": "s1_h", "type": "heading", "label": "Hockey Sweden Camp 3 Day Camp Registration Form (Hat-Trick & Short-Stick)", "required": false, "headingLevel": "h1"},
        {"id": "email", "type": "text", "label": "Email", "required": true},
        {"id": "surname", "type": "text", "label": "Participants Surname", "required": true},
        {"id": "forename", "type": "text", "label": "Participants Forename", "required": true},
        {"id": "dob", "type": "text", "label": "Participants Date Of Birth", "required": true},
        {"id": "sex", "type": "radio", "label": "Sex", "required": true, "options": ["Male", "Female", "Prefer not to say"]},
        
        {"id": "divider1", "type": "divider", "label": "", "required": false},
        {"id": "s2_h", "type": "heading", "label": "Camp Information", "required": false, "headingLevel": "h2"},
        {"id": "camp_applied", "type": "radio", "label": "Camp applied for", "required": true, "options": ["Short Sticks (2013-2018)", "Hat-Trick Heroes (2010-2016)"]},
        
        {"id": "jersey_size", "type": "image_choice", "label": "Please select jersey size required", "required": true, "imageOptions": [
            {"label": "40", "imageUrl": "https://placehold.co/400x300?text=Jersey+Size+40"},
            {"label": "50", "imageUrl": "https://placehold.co/400x300?text=Jersey+Size+50"},
            {"label": "60", "imageUrl": "https://placehold.co/400x300?text=Jersey+Size+60"}
        ]},
        
        {"id": "divider2", "type": "divider", "label": "", "required": false},
        {"id": "s3_h", "type": "heading", "label": "Participants medical information", "required": false, "headingLevel": "h2"},
        {"id": "med_asthma", "type": "radio", "label": "Suffer from asthma?", "required": true, "options": ["Yes", "No"]},
        {"id": "med_diabetes", "type": "radio", "label": "Suffer from diabetes?", "required": true, "options": ["Yes", "No"]},
        
        {"id": "divider3", "type": "divider", "label": "", "required": false},
        {"id": "s4_h", "type": "heading", "label": "Emergency contact details", "required": false, "headingLevel": "h2"},
        {"id": "emergency_name", "type": "text", "label": "Emergency Contact Name", "required": true},
        {"id": "emergency_phone", "type": "text", "label": "Emergency Contact Number", "required": true},
        
        {"id": "divider4", "type": "divider", "label": "", "required": false},
        {"id": "s5_h", "type": "heading", "label": "Agreements and Declarations", "required": false, "headingLevel": "h2"},
        {"id": "consent_medical", "type": "checkbox", "label": "I agree that the participants medical information may be disclosed to staff.", "required": true},
        {"id": "consent_rules", "type": "checkbox", "label": "I agree that the participant and the parent / guardian will abide by the rink rules.", "required": true},
        {"id": "digital_signature", "type": "text", "label": "Digital signature of person completing form", "required": true}
    ]'
);
-- Link the default template to the standard registration product
UPDATE Products SET form_template_id = 1 WHERE id = 1;

-- Create a preview guardian
INSERT INTO Guardians (full_name, email) 
VALUES ('Preview Guardian', 'preview@example.com');

-- Create a preview purchase with a fixed token
INSERT INTO Purchases (
    guardian_id, 
    camp_id, 
    product_id, 
    quantity, 
    registration_state, 
    purchase_timestamp, 
    raw_email_id, 
    price_at_purchase, 
    currency, 
    registration_token
) VALUES (
    (SELECT last_insert_rowid() FROM Guardians LIMIT 1), 
    1, 
    1, 
    1, 
    'invited', 
    CURRENT_TIMESTAMP, 
    'preview-email', 
    100, 
    'SEK', 
    'preview-token-123'
);
-- Migration: 0010-fix-forms-schema
ALTER TABLE Forms ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE Forms ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP;
-- Migration: 0011-admin-auth-tables
CREATE TABLE IF NOT EXISTS AdminSessions (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS MagicLinks (
    token TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    used INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- Create CampDays table
CREATE TABLE CampDays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    camp_id INTEGER NOT NULL,
    date TEXT NOT NULL, -- Stored as ISO8601 YYYY-MM-DD
    label TEXT,         -- e.g., "Day 1", "Friday"
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    FOREIGN KEY (camp_id) REFERENCES Camps(id)
);

-- Create Streams table
CREATE TABLE Streams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    camp_id INTEGER NOT NULL,
    name TEXT NOT NULL, -- e.g., "9–14 Elite", "Seniors"
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    FOREIGN KEY (camp_id) REFERENCES Camps(id)
);

-- Create Sessions table
CREATE TABLE Sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    camp_day_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    start_time TEXT NOT NULL, -- format "HH:MM"
    end_time TEXT NOT NULL,   -- format "HH:MM"
    location TEXT,
    FOREIGN KEY (camp_day_id) REFERENCES CampDays(id)
);

-- Create SessionStreams join table
CREATE TABLE SessionStreams (
    session_id INTEGER NOT NULL,
    stream_id INTEGER NOT NULL,
    PRIMARY KEY (session_id, stream_id),
    FOREIGN KEY (session_id) REFERENCES Sessions(id),
    FOREIGN KEY (stream_id) REFERENCES Streams(id)
);

-- Create Indexes for performance
CREATE INDEX idx_camp_days_camp_id ON CampDays(camp_id);
CREATE INDEX idx_streams_camp_id ON Streams(camp_id);
CREATE INDEX idx_sessions_camp_day_id ON Sessions(camp_day_id);
