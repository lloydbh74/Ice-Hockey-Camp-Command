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
