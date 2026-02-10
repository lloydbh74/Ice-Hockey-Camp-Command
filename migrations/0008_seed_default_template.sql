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
