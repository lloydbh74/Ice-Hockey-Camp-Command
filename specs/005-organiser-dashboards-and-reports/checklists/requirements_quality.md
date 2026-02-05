# Checklist: Organiser Dashboards and Reports - Requirements Quality

**Purpose**: This checklist serves as a pre-implementation gate to validate the quality, clarity, completeness, and consistency of the requirements for the "Organiser Dashboards and Reports" feature across `spec.md`, `plan.md`, and `tasks.md`. It is primarily intended for developers and peer reviewers.

## Requirement Completeness

- [ ] CHK001 Are all necessary components for the `/admin` web pages explicitly identified in `spec.md` (FR-001) and `plan.md`? [Completeness]
- [ ] CHK002 Are all API endpoints listed in `spec.md` (FR-002, FR-003) fully defined in `contracts/api.yaml` with all parameters and response schemas? [Completeness]
- [ ] CHK003 Are the criteria for a "selected camp" clear, especially if there's a default or initial selection mechanism? [Completeness, Spec §US1]
- [ ] CHK004 Are the specific data fields required for "total number of purchases", "completed registrations", and "missing registrations" in US1 explicitly documented? [Completeness, Spec §US1]
- [ ] CHK005 Is the definition of "key medical information" for US2 explicitly defined in `spec.md` or `data-model.md`, including data types and privacy considerations? [Completeness, Spec §US2]
- [ ] CHK006 Are all possible `itemType` and `size` values for `KitOrder` (US3) enumerated or clearly referenced? [Completeness, Spec §US3]
- [ ] CHK007 Is the process for how an organiser "manually follow up with guardians" (US4) described, if it involves any system actions or logging? [Completeness, Spec §US4]

## Requirement Clarity

- [ ] CHK008 Is "high-level statistics" (US1) for the camp dashboard clearly defined with specific metrics beyond just purchases and registrations? [Clarity, Spec §US1]
- [ ] CHK009 Is "key medical information" (US2) sufficiently clear to prevent ambiguity regarding what data should be displayed and handled? [Clarity, Spec §US2]
- [ ] CHK010 Is "accurate bulk order with the supplier" (US3) quantified? Are there specific aggregation rules or formats required beyond just item type/size/quantity? [Clarity, Spec §US3]
- [ ] CHK011 Are the definitions of 'uninvited', 'invited', 'in_progress', 'completed' for `registration_state` (FR-006, US4) clear and unambiguous, potentially with state transition diagrams if applicable? [Clarity, Spec §FR-006]

## Requirement Consistency

- [ ] CHK012 Does the `spec.md` consistently use "organiser" for the user persona, or are other terms used interchangeably? [Consistency]
- [ ] CHK013 Is the term "admin dashboard" consistent across `spec.md` and `plan.md` in terms of its scope and primary entry point? [Consistency, Spec §FR-001]
- [ ] CHK014 Are the data types and formats for `campId`, `purchase_id`, `player_id`, `registration_id`, `date` consistent between `data-model.md` and `contracts/api.yaml`? [Consistency]

## Acceptance Criteria Quality

- [ ] CHK015 Are the acceptance criteria for each user story (e.g., "total number of purchases", "list shows all players") objectively verifiable? [Acceptance Criteria Quality]
- [ ] CHK016 Can "navigated to the Attendance List view" (US1) be measured objectively (e.g., URL change, specific component rendered)? [Acceptance Criteria Quality, Spec §US1]

## Scenario Coverage

- [ ] CHK017 Are requirements defined for scenarios where no camps are available for an organiser? [Scenario Coverage, Edge Case]
- [ ] CHK018 Are requirements defined for scenarios where a selected camp has no purchases, no registrations, or no kit orders? [Scenario Coverage, Edge Case]
- [ ] CHK019 Are requirements defined for error states during API calls (e.g., network issues, invalid campId, database errors)? [Scenario Coverage, Exception Flow]
- [ ] CHK020 Are requirements defined for handling large datasets in the dashboards and CSV exports (e.g., pagination, performance considerations beyond SC-001)? [Scenario Coverage, Non-Functional]

## Edge Case Coverage

- [ ] CHK021 Is the behavior for an organiser attempting to access data for a camp they are not authorized for explicitly defined? [Edge Case Coverage, Security]
- [ ] CHK022 Are requirements defined for invalid date formats or future dates when requesting attendance data (US2)? [Edge Case Coverage, Spec §US2]
- [ ] CHK023 Is the behavior specified if a required data field (e.g., player name, guardian email) is missing or null for a report? [Edge Case Coverage]

## Non-Functional Requirements

- [ ] CHK024 Are specific performance targets (beyond "under 30 seconds" in SC-001) defined for individual API endpoints or UI interactions (e.g., latency, throughput)? [Non-Functional, Gap, Spec §SC-001]
- [ ] CHK025 Are detailed security requirements for data access (e.g., role-based access control beyond organiser/non-organiser, data encryption at rest/in transit) explicitly documented? [Non-Functional, Gap, Spec §FR-007]
- [ ] CHK026 Are accessibility requirements (e.g., WCAG compliance levels, keyboard navigation) defined for the `/admin` web pages? [Non-Functional, Gap]

## Dependencies & Assumptions

- [ ] CHK027 Is the underlying data model (from `001-d1-database-schema`) assumed to be stable, and are any dependencies on its evolution documented? [Dependencies & Assumptions]
- [ ] CHK028 Are assumptions about the availability and performance of the transactional email provider (for magic links) documented? [Dependencies & Assumptions]
- [ ] CHK029 Are any external services or integrations (e.g., for CSV processing if not entirely internal) explicitly documented with their requirements? [Dependencies & Assumptions, Gap]