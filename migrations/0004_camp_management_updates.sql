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
