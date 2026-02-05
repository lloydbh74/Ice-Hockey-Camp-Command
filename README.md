# Swedish Camp Command

Technical specification and planning documents for a modern Ice Hockey Camp Management System.

## Overview

This repository contains the design documents, user stories, and technical specifications for building a scalable platform to manage camp registrations, player data, kit orders, and daily operations.

## Key Features

-   **Dynamic Form Builder**: Organisers can create custom registration forms with specific medical questions and sizing charts.
-   **Magic Link Access**: Passwordless login for guardians and organisers.
-   **Automated Reminders**: System chases incomplete registrations automatically based on camp settings.
-   **Email Ingestion**: Parses purchase emails to trigger the registration workflow.
-   **Camp Management**: Full admin dashboard for managing camps, products, and attendance.

## Documentation Structure

The core documentation is located in the `specs/` directory, organized by build sequence:

1.  `001-d1-database-schema`: Core D1 SQL schema and data model.
2.  `002-camp-and-system-management`: Admin settings for camps and global system config.
3.  `003-email-ingestion-api`: Webhooks for parsing purchase emails.
4.  `004-registration-and-reminders`: The core registration loop and dynamic form engine.
5.  `005-organiser-dashboards-and-reports`: Admin views for attendance and kit orders.
6.  `006-camp-day-planner`: Daily schedule management for coaches.

## Getting Started

*(Instructions for local development will be added here once the build phase begins)*
