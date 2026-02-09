-- 1. Create Product (minimal schema)
INSERT OR IGNORE INTO Products (id, name, description) 
VALUES (1, 'Standard Registration', 'Elite Camp');

-- 2. Create Form (linking to Product 1)
INSERT OR IGNORE INTO Forms (id, product_id, name, schema_json, is_active, version, changelog, is_published) 
VALUES (1, 1, 'Standard Registration', '[]', 1, '1.0.0', 'Initial creation', 1);

-- 3. Link Product to Form (Skip if column missing)
-- UPDATE Products SET form_id = 1 WHERE id = 1;
