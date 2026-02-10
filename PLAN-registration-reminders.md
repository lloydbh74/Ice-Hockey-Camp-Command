# PLAN: Registration & Reminders (Spec 004)

This plan covers the implementation of the Guardian Registration flow and the Automated Reminder Engine, building on the existing Form Builder and Camp Settings foundations.

## Overview
- **Goal**: Enable guardians to complete registrations via dynamic forms and automate follow-ups for incomplete registrations.
- **Project Type**: WEB (Next.js with Cloudflare D1/Workers)

## User Review Required
> [!IMPORTANT]
> **Image Upload Implementation**: We will implement an image upload endpoint using Cloudflare R2 or similar (to be confirmed if R2 is provisioned) to support sizing charts in forms.
> **Reminder Delivery**: We will use the existing SMTP configuration to send reminders via a Cloudflare Worker Cron Trigger.

## Proposed Changes

### [Component] Form Builder Enhancements
#### [MODIFY] [PropertiesPanel.tsx](file:///c:/Users/lloyd/Sync/Swedish%20Camp%20Command/web/src/components/form/builder/PropertiesPanel.tsx)
- Add image upload UI for `image_choice` options.
- Update `FormField` type to support `image_url` for options.
#### [MODIFY] [SortableCanvasItem.tsx](file:///c:/Users/lloyd/Sync/Swedish%20Camp%20Command/web/src/components/form/builder/SortableCanvasItem.tsx)
- Update preview to render actual images for `image_choice` fields.

### [Component] Registration Flow
#### [NEW] [registration/[token]/page.tsx](file:///c:/Users/lloyd/Sync/Swedish%20Camp%20Command/web/src/app/registration/[token]/page.tsx)
- Public-facing registration page for guardians.
- Uses `PublicFormRenderer` to display the form assigned to the purchase.
#### [NEW] [api/registration/submit/route.ts](file:///c:/Users/lloyd/Sync/Swedish%20Camp%20Command/web/src/app/api/registration/submit/route.ts)
- Handles form submission.
- Maps core fields to `Players` table.
- Stores custom data in `Purchases.registration_data` (JSON).

### [Component] Reminder Engine
#### [NEW] [reminder-service.ts](file:///c:/Users/lloyd/Sync/Swedish%20Camp%20Command/web/src/lib/services/reminder-service.ts)
- Logic to identify `uninvited` or `in_progress` purchases.
- Sends emails based on `CampSettings` cadence.
#### [NEW] [api/cron/reminders/route.ts](file:///c:/Users/lloyd/Sync/Swedish%20Camp%20Command/web/src/app/api/cron/reminders/route.ts)
- Trigger endpoint for Cloudflare Worker Cron.

## Task Breakdown

### Phase 1: Form Builder Polish
- [ ] Update `FormField` interface and types <!-- id: 100 -->
- [ ] Add Image Upload UI to `PropertiesPanel` <!-- id: 101 -->
- [ ] Create `/api/admin/upload` endpoint for image handling <!-- id: 102 -->
- [ ] Update `SortableCanvasItem` to render images in preview <!-- id: 103 -->

### Phase 2: Registration Flow
- [ ] Create `GET /api/registration/[token]` to fetch form & purchase context <!-- id: 104 -->
- [ ] Implement `RegistrationPage` (Public view) <!-- id: 105 -->
- [ ] Implement `POST /api/registration/submit` logic <!-- id: 106 -->
- [ ] Verify player matching and data storage <!-- id: 107 -->

### Phase 3: Reminder Engine
- [ ] Implement `ReminderService.processReminders()` <!-- id: 108 -->
- [ ] Create email templates for Invitation and Reminder <!-- id: 109 -->
- [ ] Implement CRON trigger endpoint <!-- id: 110 -->
- [ ] Test reminder cadence and max attempts logic <!-- id: 111 -->

## Phase X: Verification
- [ ] Run `tsc --noEmit` and `eslint .`
- [ ] Verify E2E: Order Ingest -> Invitation Email received -> Registration Submitted -> State: Completed.
- [ ] Verify Reminder: Order Ingest -> Skip registration -> Verify email sent after cadence period.
