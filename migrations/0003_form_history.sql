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
