-- 0002_forms_and_templates.sql

-- Update Forms table to support versioning
-- We add 'version', 'changelog', 'is_published'
ALTER TABLE Forms ADD COLUMN version TEXT DEFAULT '1.0.0';
ALTER TABLE Forms ADD COLUMN changelog TEXT;
ALTER TABLE Forms ADD COLUMN is_published INTEGER DEFAULT 0;

-- Update FormTemplates to add description
ALTER TABLE FormTemplates ADD COLUMN description TEXT;
ALTER TABLE FormTemplates ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP;
