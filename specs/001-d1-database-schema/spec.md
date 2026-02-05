# Feature Specification: D1 Database Schema

**Feature Branch**: `001-d1-database-schema`  
**Created**: 2026-02-03  
**Status**: Draft  
**Input**: User description: "Use the schema you inferred from data/ciha-swedish-camp-latest.csv as the starting point for the D1 database design for Swedish Camp Command. Refine it to support multiple camps, registration status, reminders and camp product orders per player."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Foundational Schema (Priority: P1)

As a Developer, I need a normalized and refined D1 database schema so that I can build the camp management features on a solid and scalable data foundation that directly supports the core architectural principles of the application.

**Why this priority**: The entire application's functionality depends on a well-designed database schema. This is the critical first step before any feature development can begin.

**Independent Test**: The schema can be validated by deploying it to a D1 instance and running a series of seed scripts to confirm that all relationships, constraints, and data types function as expected.

**Acceptance Scenarios**:

1. **Given** the schema is deployed, **When** a `Purchase` record is created from a parsed email, **Then** it is successfully stored with an `uninvited` registration state.
2. **Given** a `Purchase` exists, **When** a `Registration` is created and linked to it, **Then** the `registration_state` on the `Purchase` can be updated to `completed`.
3. **Given** a `Guardian` exists, **When** two `Players` are created for that guardian, **Then** both `Players` records are correctly linked back to the single `Guardian` via `guardian_id`.
4. **Given** a `Registration` exists, **When** multiple `KitOrders` (e.g., a jersey and a t-shirt) are added, **Then** both are correctly linked to the single `Registration`.
5. **Given** a `Purchase` has a state of `invited`, **When** a `Reminder` is sent, **Then** a record of the reminder is created and linked to that `Purchase`.

### Edge Cases

- What happens when a single email purchase is for multiple, different products (e.g., one 'Hat-Trick' camp and one 'Short Sticks' camp)?
- How are players uniquely identified if a guardian registers two children with the same name (e.g., for different camps over time)? The combination of `guardian_id`, `first_name`, `last_name`, and `date_of_birth` should provide sufficient uniqueness.
- What happens if a parsed email contains a product that does not exist in the `Products` table? The ingestion process should flag this as an error.

## Assumptions

- This specification is inherently technical because the core feature request is the design of a database schema. The SQL `CREATE TABLE` statements are provided as a precise, formal definition of the data model's structure, entities, and relationships, which is the primary requirement of this feature.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The database schema MUST be deployable to a target SQL database environment.
- **FR-002**: The schema MUST define the tables and their structures as specified by the SQL `CREATE TABLE` statements in FR-007.
- **FR-003**: The schema MUST enforce a one-to-many relationship between `Guardians` and `Players`.
- **FR-004**: The schema MUST link `Purchases` to `Camps` and `Guardians`, and track a `registration_state` (`uninvited`, `invited`, `in_progress`, `completed`).
- **FR-005**: The schema MUST allow multiple `KitOrders` to be associated with a single `Registration`.
- **FR-006**: The schema MUST provide a `Reminders` table to log reminder events against a `Purchase`.
- **FR-007**: The schema is defined by the following SQL `CREATE TABLE` statements:
  
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
  ```

### Key Entities *(include if feature involves data)*

- **Camps**: The overarching event (e.g., "Swedish Hockey Camp 2026").
- **Products**: The specific items for sale (e.g., "Hat-Trick Heroes" attendance).
- **Guardians**: The person who purchases the camp spot and registers the player.
- **Players**: The child attending the camp.
- **Purchases**: The record of a sale, parsed from an email. Drives the registration workflow.
- **Registrations**: The detailed information for a player, submitted by a guardian.
- **KitOrders**: Specific apparel orders linked to a registration.
- **Reminders**: Records of reminder emails sent to guardians.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The schema MUST successfully deploy to the target database without errors.
- **SC-002**: All foreign key relationships MUST be valid, ensuring that, for example, a `Registration` cannot be created for a non-existent `Player` or `Purchase`.
- **SC-003**: The schema design MUST adhere to 3rd Normal Form (3NF) to ensure a normalized and refined database structure.
- **SC-004**: A data seeding script that populates every table with sample data MUST complete successfully, confirming all constraints and relationships work as designed.