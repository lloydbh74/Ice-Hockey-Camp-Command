-- Migration number: 0007 	 2026-02-10T14:40:00Z
-- Feature: 004-registration-flow

-- Add registration token and data storage to Purchases
ALTER TABLE Purchases ADD COLUMN registration_token TEXT;
ALTER TABLE Purchases ADD COLUMN registration_data TEXT; -- Stores form response JSON
CREATE UNIQUE INDEX idx_purchases_registration_token ON Purchases(registration_token);

-- Index for registration state lookups (useful for reminders)
CREATE INDEX idx_purchases_registration_state ON Purchases(registration_state);
