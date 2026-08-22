-- ═══════════════════════════════════════════════════════════════════════════
-- IMPORT SCHEDULES FOR KEMPE, NYLANDER, AND PRO GROUPS (Camp ID = 2)
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Ensure Streams exist for Camp 2
INSERT OR IGNORE INTO Streams (camp_id, name, status) VALUES 
(2, 'Group Kempe', 'active'),
(2, 'Group Nylander', 'active'),
(2, 'Group Pro', 'active');

-- 2. Insert Camp Days for Camp 2
INSERT OR IGNORE INTO CampDays (camp_id, date, label, status) VALUES 
(2, '2025-08-23', 'Sunday 23rd Aug', 'active'),
(2, '2025-08-24', 'Monday 24th Aug', 'active'),
(2, '2025-08-25', 'Tuesday 25th Aug', 'active'),
(2, '2025-08-26', 'Wednesday 26th Aug', 'active'),
(2, '2025-08-27', 'Thursday 27th Aug', 'active'),
(2, '2025-08-28', 'Friday 28th Aug', 'active');

-- Clean up existing sessions for these days to prevent duplicate import
DELETE FROM Sessions 
WHERE camp_day_id IN (
    SELECT id FROM CampDays 
    WHERE camp_id = 2 
      AND date IN ('2025-08-23', '2025-08-24', '2025-08-25', '2025-08-26', '2025-08-27', '2025-08-28')
);

-- ───────────────────────────────────────────────────────────────────────────
-- A. GROUP PRO SCHEDULE (Aug 23 - Aug 25)
-- ───────────────────────────────────────────────────────────────────────────

-- Sunday 23rd Aug - Pro
INSERT INTO Sessions (camp_day_id, name, start_time, end_time, location) VALUES
((SELECT id FROM CampDays WHERE date = '2025-08-23' AND camp_id = 2), 'Registration/Arrive', '07:00', '07:30', NULL),
((SELECT id FROM CampDays WHERE date = '2025-08-23' AND camp_id = 2), 'Ice session', '07:45', '08:40', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2025-08-23' AND camp_id = 2), 'Skills', '09:00', '10:00', 'Sports Hall'),
((SELECT id FROM CampDays WHERE date = '2025-08-23' AND camp_id = 2), 'Activity (Team Building)', '10:15', '11:15', NULL),
((SELECT id FROM CampDays WHERE date = '2025-08-23' AND camp_id = 2), 'Lunch', '11:15', '12:00', 'Cafeteria'),
((SELECT id FROM CampDays WHERE date = '2025-08-23' AND camp_id = 2), 'Ice session', '12:15', '13:10', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2025-08-23' AND camp_id = 2), 'Off Ice fitness', '14:00', '15:00', 'Outside'),
((SELECT id FROM CampDays WHERE date = '2025-08-23' AND camp_id = 2), 'Video session', '15:15', '16:10', 'Studio'),
((SELECT id FROM CampDays WHERE date = '2025-08-23' AND camp_id = 2), 'Short Game', '16:45', '17:30', 'Rink');

-- Monday 24th Aug - Pro
INSERT INTO Sessions (camp_day_id, name, start_time, end_time, location) VALUES
((SELECT id FROM CampDays WHERE date = '2025-08-24' AND camp_id = 2), 'Arrive', '06:30', '06:45', NULL),
((SELECT id FROM CampDays WHERE date = '2025-08-24' AND camp_id = 2), 'Ice session', '07:15', '08:10', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2025-08-24' AND camp_id = 2), 'Skills', '08:30', '09:30', 'Sports Hall'),
((SELECT id FROM CampDays WHERE date = '2025-08-24' AND camp_id = 2), 'Off Ice fitness', '09:45', '10:45', 'Outside/warm-up'),
((SELECT id FROM CampDays WHERE date = '2025-08-24' AND camp_id = 2), 'Ice session', '11:15', '12:10', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2025-08-24' AND camp_id = 2), 'Lunch', '12:15', '13:15', 'Cafeteria'),
((SELECT id FROM CampDays WHERE date = '2025-08-24' AND camp_id = 2), 'Gym session', '13:30', '14:30', 'Gym'),
((SELECT id FROM CampDays WHERE date = '2025-08-24' AND camp_id = 2), 'Game', '15:15', '16:10', 'Rink');

-- Tuesday 25th Aug - Pro
INSERT INTO Sessions (camp_day_id, name, start_time, end_time, location) VALUES
((SELECT id FROM CampDays WHERE date = '2025-08-25' AND camp_id = 2), 'Arrive', '07:30', '07:30', NULL),
((SELECT id FROM CampDays WHERE date = '2025-08-25' AND camp_id = 2), 'Ice session', '08:00', '08:55', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2025-08-25' AND camp_id = 2), 'Skills', '09:30', '10:30', 'Sports Hall'),
((SELECT id FROM CampDays WHERE date = '2025-08-25' AND camp_id = 2), 'Break / Lunch', '10:45', '11:45', 'Cafeteria'),
((SELECT id FROM CampDays WHERE date = '2025-08-25' AND camp_id = 2), 'Ice session', '12:00', '13:00', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2025-08-25' AND camp_id = 2), 'Video session', '13:30', '14:15', 'Studio'),
((SELECT id FROM CampDays WHERE date = '2025-08-25' AND camp_id = 2), 'Game', '14:30', '15:45', 'Rink');

-- Link Pro Sessions to Pro Streams
INSERT INTO SessionStreams (session_id, stream_id)
SELECT s.id, st.id
FROM Sessions s
JOIN CampDays cd ON s.camp_day_id = cd.id
JOIN Streams st ON st.camp_id = cd.camp_id AND (st.name = 'Group Pro' OR st.name LIKE 'Advanced Pro%')
WHERE cd.date IN ('2025-08-23', '2025-08-24', '2025-08-25') AND cd.camp_id = 2;


-- ───────────────────────────────────────────────────────────────────────────
-- B. GROUP KEMPE SCHEDULE (Aug 26 - Aug 28)
-- ───────────────────────────────────────────────────────────────────────────

-- Wednesday 26th Aug - Kempe
INSERT INTO Sessions (camp_day_id, name, start_time, end_time, location) VALUES
((SELECT id FROM CampDays WHERE date = '2025-08-26' AND camp_id = 2), 'Kempe: Arrive/registration', '06:30', '06:45', NULL),
((SELECT id FROM CampDays WHERE date = '2025-08-26' AND camp_id = 2), 'Kempe: Ice session', '07:15', '08:15', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2025-08-26' AND camp_id = 2), 'Kempe: Skills', '08:30', '09:30', 'Sports Hall'),
((SELECT id FROM CampDays WHERE date = '2025-08-26' AND camp_id = 2), 'Kempe: Activity (Team Building)', '10:00', '11:00', NULL),
((SELECT id FROM CampDays WHERE date = '2025-08-26' AND camp_id = 2), 'Kempe: Ice session', '11:15', '12:15', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2025-08-26' AND camp_id = 2), 'Kempe: Lunch', '12:30', '13:30', 'Cafeteria'),
((SELECT id FROM CampDays WHERE date = '2025-08-26' AND camp_id = 2), 'Kempe: Off Ice fitness', '13:45', '14:45', 'Outside'),
((SELECT id FROM CampDays WHERE date = '2025-08-26' AND camp_id = 2), 'Kempe: Game', '15:15', '15:45', 'Rink');

-- Thursday 27th Aug - Kempe
INSERT INTO Sessions (camp_day_id, name, start_time, end_time, location) VALUES
((SELECT id FROM CampDays WHERE date = '2025-08-27' AND camp_id = 2), 'Kempe: Arrive', '07:30', '07:45', NULL),
((SELECT id FROM CampDays WHERE date = '2025-08-27' AND camp_id = 2), 'Kempe: Ice session', '08:00', '09:00', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2025-08-27' AND camp_id = 2), 'Kempe: Skills', '09:30', '10:30', 'Sports Hall'),
((SELECT id FROM CampDays WHERE date = '2025-08-27' AND camp_id = 2), 'Kempe: Lunch', '10:30', '12:00', 'Cafeteria'),
((SELECT id FROM CampDays WHERE date = '2025-08-27' AND camp_id = 2), 'Kempe: Ice session', '12:15', '13:15', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2025-08-27' AND camp_id = 2), 'Kempe: Off Ice fitness', '13:30', '14:30', 'Outside'),
((SELECT id FROM CampDays WHERE date = '2025-08-27' AND camp_id = 2), 'Kempe: Activity (Team Building)', '14:45', '15:45', NULL),
((SELECT id FROM CampDays WHERE date = '2025-08-27' AND camp_id = 2), 'Kempe: Game', '16:15', '17:10', 'Rink');

-- Friday 28th Aug - Kempe
INSERT INTO Sessions (camp_day_id, name, start_time, end_time, location) VALUES
((SELECT id FROM CampDays WHERE date = '2025-08-28' AND camp_id = 2), 'Kempe: Arrive', '07:30', '07:45', NULL),
((SELECT id FROM CampDays WHERE date = '2025-08-28' AND camp_id = 2), 'Kempe: Ice session', '08:00', '09:00', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2025-08-28' AND camp_id = 2), 'Kempe: Skills', '09:30', '10:30', 'Sports Hall'),
((SELECT id FROM CampDays WHERE date = '2025-08-28' AND camp_id = 2), 'Kempe: Lunch', '10:30', '12:00', 'Cafeteria'),
((SELECT id FROM CampDays WHERE date = '2025-08-28' AND camp_id = 2), 'Kempe: Ice session', '12:15', '13:15', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2025-08-28' AND camp_id = 2), 'Kempe: Activity', '13:30', '14:30', NULL),
((SELECT id FROM CampDays WHERE date = '2025-08-28' AND camp_id = 2), 'Kempe: Off Ice fitness', '14:45', '15:45', 'Outside'),
((SELECT id FROM CampDays WHERE date = '2025-08-28' AND camp_id = 2), 'Kempe: Game', '16:15', '17:10', 'Rink');

-- Link Kempe Sessions to Kempe Streams
INSERT INTO SessionStreams (session_id, stream_id)
SELECT s.id, st.id
FROM Sessions s
JOIN CampDays cd ON s.camp_day_id = cd.id
JOIN Streams st ON st.camp_id = cd.camp_id AND (st.name = 'Group Kempe' OR st.name LIKE 'Kempe Group%')
WHERE s.name LIKE 'Kempe:%' AND cd.date IN ('2025-08-26', '2025-08-27', '2025-08-28') AND cd.camp_id = 2;


-- ───────────────────────────────────────────────────────────────────────────
-- C. GROUP NYLANDER SCHEDULE (Aug 26 - Aug 28)
-- ───────────────────────────────────────────────────────────────────────────

-- Wednesday 26th Aug - Nylander
INSERT INTO Sessions (camp_day_id, name, start_time, end_time, location) VALUES
((SELECT id FROM CampDays WHERE date = '2025-08-26' AND camp_id = 2), 'Nylander: Arrive/registration', '07:30', '07:45', NULL),
((SELECT id FROM CampDays WHERE date = '2025-08-26' AND camp_id = 2), 'Nylander: Ice session', '08:15', '09:15', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2025-08-26' AND camp_id = 2), 'Nylander: Skills', '09:30', '10:30', 'Sports Hall'),
((SELECT id FROM CampDays WHERE date = '2025-08-26' AND camp_id = 2), 'Nylander: Activity (Team Building)', '11:00', '12:00', NULL),
((SELECT id FROM CampDays WHERE date = '2025-08-26' AND camp_id = 2), 'Nylander: Ice session', '12:15', '13:15', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2025-08-26' AND camp_id = 2), 'Nylander: Lunch', '13:30', '14:30', 'Cafeteria'),
((SELECT id FROM CampDays WHERE date = '2025-08-26' AND camp_id = 2), 'Nylander: Off Ice fitness', '14:45', '15:45', 'Outside'),
((SELECT id FROM CampDays WHERE date = '2025-08-26' AND camp_id = 2), 'Nylander: Game', '15:45', '16:15', 'Rink');

-- Thursday 27th Aug - Nylander
INSERT INTO Sessions (camp_day_id, name, start_time, end_time, location) VALUES
((SELECT id FROM CampDays WHERE date = '2025-08-27' AND camp_id = 2), 'Nylander: Arrive/registration', '08:30', '08:45', NULL),
((SELECT id FROM CampDays WHERE date = '2025-08-27' AND camp_id = 2), 'Nylander: Ice session', '09:00', '10:00', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2025-08-27' AND camp_id = 2), 'Nylander: Skills', '10:30', '11:30', 'Sports Hall'),
((SELECT id FROM CampDays WHERE date = '2025-08-27' AND camp_id = 2), 'Nylander: Lunch', '11:30', '13:00', 'Cafeteria'),
((SELECT id FROM CampDays WHERE date = '2025-08-27' AND camp_id = 2), 'Nylander: Ice session', '13:15', '14:15', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2025-08-27' AND camp_id = 2), 'Nylander: Off Ice fitness', '14:30', '15:30', 'Outside'),
((SELECT id FROM CampDays WHERE date = '2025-08-27' AND camp_id = 2), 'Nylander: Activity (Team Building)', '15:45', '16:45', NULL),
((SELECT id FROM CampDays WHERE date = '2025-08-27' AND camp_id = 2), 'Nylander: Game', '17:20', '18:15', 'Rink');

-- Friday 28th Aug - Nylander
INSERT INTO Sessions (camp_day_id, name, start_time, end_time, location) VALUES
((SELECT id FROM CampDays WHERE date = '2025-08-28' AND camp_id = 2), 'Nylander: Arrive/registration', '08:30', '08:45', NULL),
((SELECT id FROM CampDays WHERE date = '2025-08-28' AND camp_id = 2), 'Nylander: Ice session', '09:00', '10:00', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2025-08-28' AND camp_id = 2), 'Nylander: Skills', '10:30', '11:30', 'Sports Hall'),
((SELECT id FROM CampDays WHERE date = '2025-08-28' AND camp_id = 2), 'Nylander: Lunch', '11:30', '13:00', 'Cafeteria'),
((SELECT id FROM CampDays WHERE date = '2025-08-28' AND camp_id = 2), 'Nylander: Ice session', '13:15', '14:15', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2025-08-28' AND camp_id = 2), 'Nylander: Activity', '14:30', '15:30', NULL),
((SELECT id FROM CampDays WHERE date = '2025-08-28' AND camp_id = 2), 'Nylander: Off Ice fitness', '15:45', '16:45', 'Outside'),
((SELECT id FROM CampDays WHERE date = '2025-08-28' AND camp_id = 2), 'Nylander: Game', '17:20', '18:15', 'Rink');

-- Link Nylander Sessions to Nylander Streams
INSERT INTO SessionStreams (session_id, stream_id)
SELECT s.id, st.id
FROM Sessions s
JOIN CampDays cd ON s.camp_day_id = cd.id
JOIN Streams st ON st.camp_id = cd.camp_id AND (st.name = 'Group Nylander' OR st.name LIKE 'Nylander Group%')
WHERE s.name LIKE 'Nylander:%' AND cd.date IN ('2025-08-26', '2025-08-27', '2025-08-28') AND cd.camp_id = 2;
