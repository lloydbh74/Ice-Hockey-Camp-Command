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
