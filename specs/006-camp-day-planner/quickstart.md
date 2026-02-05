# Quickstart: Camp Day Planner

This guide provides a quick overview for organisers on how to access and utilize the Camp Day Planner features within the admin UI, and for coaches on how to view their schedules.

## 1. Accessing the Admin Schedule Planner

Access to the organiser admin schedule planner is part of the overall admin dashboard, secured via magic links (as per the system's authentication strategy).

1.  **Login**: Use your secure magic link to log into the admin dashboard.
2.  **Navigate to Schedule**: Once logged in, navigate to `/admin/camps/[campId]/schedule` (replacing `[campId]` with the relevant camp ID). You should see the interface for managing camp days and sessions.

## 2. Defining Camp Days

The first step in building a schedule is to define the individual days of the camp.

1.  **Select a Camp**: Ensure you are on the schedule planner for the correct camp.
2.  **Add New Day**: Locate the option to "Add New Day". Enter the date and an optional label (e.g., "Day 1", "Friday").
3.  **Confirm**: The new day will appear in the planner UI, ready for sessions to be scheduled.

## 3. Managing Streams

Streams represent participant groups (e.g., "9–14 Elite"). Sessions can be assigned to one or more streams.

1.  **Navigate to Streams Management**: Access the section within the planner (or settings) to manage Streams for the current camp.
2.  **Create/Edit Stream**: Add new streams by providing a name, or edit existing ones.
3.  **View Streams**: The defined streams will be available for selection when creating or editing sessions.

## 4. Scheduling Sessions

Create detailed sessions with specific times, locations, and assign them to streams.

1.  **Select a Camp Day**: On the planner UI, choose the `CampDay` where you want to add a session.
2.  **Add New Session**: Locate the option to "Add New Session". Enter the session name, start time, end time, location, and a description.
3.  **Assign Streams**: Select one or more `Streams` that this session applies to.
4.  **Confirm**: The new session will appear on the visual timeline for that day.

## 5. Adjusting Schedule Visually (Drag and Drop)

The planner offers a drag-and-drop interface for quick adjustments.

1.  **Drag Session**: Click and drag a `Session` block on the timeline.
2.  **Drop Session**: Drop the session into a new time slot on the same day. The session's start and end times will be updated automatically in the database.
3.  **Conflict Prevention**: The UI will visually flag or prevent drops that would cause scheduling overlaps within the same stream.

## 6. Accessing the Read-Only Coach View

Coaches can view their specific schedules via a simple URL.

1.  **Obtain URL**: An organiser will provide a specific URL for a camp day and stream (e.g., `/coach/camps/1/day/1?streamId=1`).
2.  **Open Link**: Open this URL on any device (e.g., mobile phone).
3.  **View Schedule**: You will see a read-only list or timeline of only the sessions assigned to that specific day and stream, without needing to log in.

**Note**: Organisers should be careful when deleting `Camp` or `Stream` entities that have associated schedules or sessions, as the system will prevent full deletion and instead suggest archiving or deactivating to preserve data integrity.