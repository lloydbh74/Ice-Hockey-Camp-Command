-- ═══════════════════════════════════════════════════════════════════════════
-- FIX SCHEDULE DATES FOR 2026 CAMP (Camp ID = 2)
-- Camp runs: Sunday 23rd Aug 2026 to Friday 28th Aug 2026
-- ═══════════════════════════════════════════════════════════════════════════

-- Delete all 2025 CampDays and associated sessions for Camp 2
DELETE FROM SessionStreams WHERE session_id IN (
    SELECT s.id FROM Sessions s JOIN CampDays cd ON s.camp_day_id = cd.id WHERE cd.camp_id = 2
);
DELETE FROM Sessions WHERE camp_day_id IN (
    SELECT id FROM CampDays WHERE camp_id = 2
);
DELETE FROM CampDays WHERE camp_id = 2;

-- 1. Ensure all Streams exist for Camp 2
INSERT OR IGNORE INTO Streams (camp_id, name, status) VALUES 
(2, 'Elite Group', 'active'),
(2, 'Group Pro', 'active'),
(2, 'Group Kempe', 'active'),
(2, 'Group Nylander', 'active');

-- 2. Insert 2026 Camp Days for Camp 2
INSERT INTO CampDays (camp_id, date, label, status) VALUES 
(2, '2026-08-23', 'Sunday 23rd Aug', 'active'),
(2, '2026-08-24', 'Monday 24th Aug', 'active'),
(2, '2026-08-25', 'Tuesday 25th Aug', 'active'),
(2, '2026-08-26', 'Wednesday 26th Aug', 'active'),
(2, '2026-08-27', 'Thursday 27th Aug', 'active'),
(2, '2026-08-28', 'Friday 28th Aug', 'active');


-- ───────────────────────────────────────────────────────────────────────────
-- 1. ELITE GROUP (Sun 23 Aug - Tue 25 Aug 2026)
-- ───────────────────────────────────────────────────────────────────────────

-- Sun 23 Aug 2026 - Elite
INSERT INTO Sessions (camp_day_id, name, start_time, end_time, location) VALUES
((SELECT id FROM CampDays WHERE date = '2026-08-23' AND camp_id = 2), 'Elite: Registration/Arrive', '08:00', '08:30', NULL),
((SELECT id FROM CampDays WHERE date = '2026-08-23' AND camp_id = 2), 'Elite: Ice session', '08:50', '09:45', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2026-08-23' AND camp_id = 2), 'Elite: Skills', '10:00', '11:00', 'Sports Hall'),
((SELECT id FROM CampDays WHERE date = '2026-08-23' AND camp_id = 2), 'Elite: Activity', '11:15', '12:15', NULL),
((SELECT id FROM CampDays WHERE date = '2026-08-23' AND camp_id = 2), 'Elite: Lunch', '12:15', '13:00', 'Cafeteria'),
((SELECT id FROM CampDays WHERE date = '2026-08-23' AND camp_id = 2), 'Elite: Ice session', '13:20', '14:15', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2026-08-23' AND camp_id = 2), 'Elite: Off Ice fitness', '15:00', '16:00', 'Outside'),
((SELECT id FROM CampDays WHERE date = '2026-08-23' AND camp_id = 2), 'Elite: Video session', '16:10', '17:00', 'Studio'),
((SELECT id FROM CampDays WHERE date = '2026-08-23' AND camp_id = 2), 'Elite: Short Game', '17:45', '18:30', 'Rink');

-- Mon 24 Aug 2026 - Elite
INSERT INTO Sessions (camp_day_id, name, start_time, end_time, location) VALUES
((SELECT id FROM CampDays WHERE date = '2026-08-24' AND camp_id = 2), 'Elite: Arrive', '07:30', '07:45', NULL),
((SELECT id FROM CampDays WHERE date = '2026-08-24' AND camp_id = 2), 'Elite: Ice session', '08:20', '09:15', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2026-08-24' AND camp_id = 2), 'Elite: Skills', '09:30', '10:30', 'Sports Hall'),
((SELECT id FROM CampDays WHERE date = '2026-08-24' AND camp_id = 2), 'Elite: Off Ice fitness', '10:45', '11:45', 'Outside/warm-up'),
((SELECT id FROM CampDays WHERE date = '2026-08-24' AND camp_id = 2), 'Elite: Ice session', '12:20', '13:15', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2026-08-24' AND camp_id = 2), 'Elite: Lunch', '13:15', '14:15', 'Cafeteria'),
((SELECT id FROM CampDays WHERE date = '2026-08-24' AND camp_id = 2), 'Elite: Gym session', '14:30', '15:30', 'Gym'),
((SELECT id FROM CampDays WHERE date = '2026-08-24' AND camp_id = 2), 'Elite: Game', '16:20', '17:15', 'Rink');

-- Tue 25 Aug 2026 - Elite
INSERT INTO Sessions (camp_day_id, name, start_time, end_time, location) VALUES
((SELECT id FROM CampDays WHERE date = '2026-08-25' AND camp_id = 2), 'Elite: Arrive', '08:30', '08:30', NULL),
((SELECT id FROM CampDays WHERE date = '2026-08-25' AND camp_id = 2), 'Elite: Ice session', '09:05', '10:00', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2026-08-25' AND camp_id = 2), 'Elite: Skills', '10:30', '11:30', 'Sports Hall'),
((SELECT id FROM CampDays WHERE date = '2026-08-25' AND camp_id = 2), 'Elite: Break / Lunch', '11:45', '12:45', 'Cafeteria'),
((SELECT id FROM CampDays WHERE date = '2026-08-25' AND camp_id = 2), 'Elite: Ice session', '13:15', '14:15', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2026-08-25' AND camp_id = 2), 'Elite: Video session', '14:45', '15:30', 'Studio'),
((SELECT id FROM CampDays WHERE date = '2026-08-25' AND camp_id = 2), 'Elite: Game', '16:00', '17:15', 'Rink');

-- Link Elite Sessions
INSERT INTO SessionStreams (session_id, stream_id)
SELECT s.id, st.id
FROM Sessions s
JOIN CampDays cd ON s.camp_day_id = cd.id
JOIN Streams st ON st.camp_id = cd.camp_id AND (st.name = 'Elite Group' OR st.name LIKE 'Advanced Elite%')
WHERE s.name LIKE 'Elite:%' AND cd.camp_id = 2;


-- ───────────────────────────────────────────────────────────────────────────
-- 2. GROUP PRO (Sun 23 Aug - Tue 25 Aug 2026)
-- ───────────────────────────────────────────────────────────────────────────

-- Sun 23 Aug 2026 - Pro
INSERT INTO Sessions (camp_day_id, name, start_time, end_time, location) VALUES
((SELECT id FROM CampDays WHERE date = '2026-08-23' AND camp_id = 2), 'Pro: Registration/Arrive', '07:00', '07:30', NULL),
((SELECT id FROM CampDays WHERE date = '2026-08-23' AND camp_id = 2), 'Pro: Ice session', '07:45', '08:40', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2026-08-23' AND camp_id = 2), 'Pro: Skills', '09:00', '10:00', 'Sports Hall'),
((SELECT id FROM CampDays WHERE date = '2026-08-23' AND camp_id = 2), 'Pro: Activity (Team Building)', '10:15', '11:15', NULL),
((SELECT id FROM CampDays WHERE date = '2026-08-23' AND camp_id = 2), 'Pro: Lunch', '11:15', '12:00', 'Cafeteria'),
((SELECT id FROM CampDays WHERE date = '2026-08-23' AND camp_id = 2), 'Pro: Ice session', '12:15', '13:10', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2026-08-23' AND camp_id = 2), 'Pro: Off Ice fitness', '14:00', '15:00', 'Outside'),
((SELECT id FROM CampDays WHERE date = '2026-08-23' AND camp_id = 2), 'Pro: Video session', '15:15', '16:10', 'Studio'),
((SELECT id FROM CampDays WHERE date = '2026-08-23' AND camp_id = 2), 'Pro: Short Game', '16:45', '17:30', 'Rink');

-- Mon 24 Aug 2026 - Pro
INSERT INTO Sessions (camp_day_id, name, start_time, end_time, location) VALUES
((SELECT id FROM CampDays WHERE date = '2026-08-24' AND camp_id = 2), 'Pro: Arrive', '06:30', '06:45', NULL),
((SELECT id FROM CampDays WHERE date = '2026-08-24' AND camp_id = 2), 'Pro: Ice session', '07:15', '08:10', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2026-08-24' AND camp_id = 2), 'Pro: Skills', '08:30', '09:30', 'Sports Hall'),
((SELECT id FROM CampDays WHERE date = '2026-08-24' AND camp_id = 2), 'Pro: Off Ice fitness', '09:45', '10:45', 'Outside/warm-up'),
((SELECT id FROM CampDays WHERE date = '2026-08-24' AND camp_id = 2), 'Pro: Ice session', '11:15', '12:10', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2026-08-24' AND camp_id = 2), 'Pro: Lunch', '12:15', '13:15', 'Cafeteria'),
((SELECT id FROM CampDays WHERE date = '2026-08-24' AND camp_id = 2), 'Pro: Gym session', '13:30', '14:30', 'Gym'),
((SELECT id FROM CampDays WHERE date = '2026-08-24' AND camp_id = 2), 'Pro: Game', '15:15', '16:10', 'Rink');

-- Tue 25 Aug 2026 - Pro
INSERT INTO Sessions (camp_day_id, name, start_time, end_time, location) VALUES
((SELECT id FROM CampDays WHERE date = '2026-08-25' AND camp_id = 2), 'Pro: Arrive', '07:30', '07:30', NULL),
((SELECT id FROM CampDays WHERE date = '2026-08-25' AND camp_id = 2), 'Pro: Ice session', '08:00', '08:55', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2026-08-25' AND camp_id = 2), 'Pro: Skills', '09:30', '10:30', 'Sports Hall'),
((SELECT id FROM CampDays WHERE date = '2026-08-25' AND camp_id = 2), 'Pro: Break / Lunch', '10:45', '11:45', 'Cafeteria'),
((SELECT id FROM CampDays WHERE date = '2026-08-25' AND camp_id = 2), 'Pro: Ice session', '12:00', '13:00', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2026-08-25' AND camp_id = 2), 'Pro: Video session', '13:30', '14:15', 'Studio'),
((SELECT id FROM CampDays WHERE date = '2026-08-25' AND camp_id = 2), 'Pro: Game', '14:30', '15:45', 'Rink');

-- Link Pro Sessions
INSERT INTO SessionStreams (session_id, stream_id)
SELECT s.id, st.id
FROM Sessions s
JOIN CampDays cd ON s.camp_day_id = cd.id
JOIN Streams st ON st.camp_id = cd.camp_id AND (st.name = 'Group Pro' OR st.name LIKE 'Advanced Pro%')
WHERE s.name LIKE 'Pro:%' AND cd.camp_id = 2;


-- ───────────────────────────────────────────────────────────────────────────
-- 3. GROUP KEMPE (Wed 26 Aug - Fri 28 Aug 2026)
-- ───────────────────────────────────────────────────────────────────────────

-- Wed 26 Aug 2026 - Kempe
INSERT INTO Sessions (camp_day_id, name, start_time, end_time, location) VALUES
((SELECT id FROM CampDays WHERE date = '2026-08-26' AND camp_id = 2), 'Kempe: Arrive/registration', '06:30', '06:45', NULL),
((SELECT id FROM CampDays WHERE date = '2026-08-26' AND camp_id = 2), 'Kempe: Ice session', '07:15', '08:15', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2026-08-26' AND camp_id = 2), 'Kempe: Skills', '08:30', '09:30', 'Sports Hall'),
((SELECT id FROM CampDays WHERE date = '2026-08-26' AND camp_id = 2), 'Kempe: Activity (Team Building)', '10:00', '11:00', NULL),
((SELECT id FROM CampDays WHERE date = '2026-08-26' AND camp_id = 2), 'Kempe: Ice session', '11:15', '12:15', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2026-08-26' AND camp_id = 2), 'Kempe: Lunch', '12:30', '13:30', 'Cafeteria'),
((SELECT id FROM CampDays WHERE date = '2026-08-26' AND camp_id = 2), 'Kempe: Off Ice fitness', '13:45', '14:45', 'Outside'),
((SELECT id FROM CampDays WHERE date = '2026-08-26' AND camp_id = 2), 'Kempe: Game', '15:15', '15:45', 'Rink');

-- Thu 27 Aug 2026 - Kempe
INSERT INTO Sessions (camp_day_id, name, start_time, end_time, location) VALUES
((SELECT id FROM CampDays WHERE date = '2026-08-27' AND camp_id = 2), 'Kempe: Arrive', '07:30', '07:45', NULL),
((SELECT id FROM CampDays WHERE date = '2026-08-27' AND camp_id = 2), 'Kempe: Ice session', '08:00', '09:00', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2026-08-27' AND camp_id = 2), 'Kempe: Skills', '09:30', '10:30', 'Sports Hall'),
((SELECT id FROM CampDays WHERE date = '2026-08-27' AND camp_id = 2), 'Kempe: Lunch', '10:30', '12:00', 'Cafeteria'),
((SELECT id FROM CampDays WHERE date = '2026-08-27' AND camp_id = 2), 'Kempe: Ice session', '12:15', '13:15', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2026-08-27' AND camp_id = 2), 'Kempe: Off Ice fitness', '13:30', '14:30', 'Outside'),
((SELECT id FROM CampDays WHERE date = '2026-08-27' AND camp_id = 2), 'Kempe: Activity (Team Building)', '14:45', '15:45', NULL),
((SELECT id FROM CampDays WHERE date = '2026-08-27' AND camp_id = 2), 'Kempe: Game', '16:15', '17:10', 'Rink');

-- Fri 28 Aug 2026 - Kempe
INSERT INTO Sessions (camp_day_id, name, start_time, end_time, location) VALUES
((SELECT id FROM CampDays WHERE date = '2026-08-28' AND camp_id = 2), 'Kempe: Arrive', '07:30', '07:45', NULL),
((SELECT id FROM CampDays WHERE date = '2026-08-28' AND camp_id = 2), 'Kempe: Ice session', '08:00', '09:00', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2026-08-28' AND camp_id = 2), 'Kempe: Skills', '09:30', '10:30', 'Sports Hall'),
((SELECT id FROM CampDays WHERE date = '2026-08-28' AND camp_id = 2), 'Kempe: Lunch', '10:30', '12:00', 'Cafeteria'),
((SELECT id FROM CampDays WHERE date = '2026-08-28' AND camp_id = 2), 'Kempe: Ice session', '12:15', '13:15', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2026-08-28' AND camp_id = 2), 'Kempe: Activity', '13:30', '14:30', NULL),
((SELECT id FROM CampDays WHERE date = '2026-08-28' AND camp_id = 2), 'Kempe: Off Ice fitness', '14:45', '15:45', 'Outside'),
((SELECT id FROM CampDays WHERE date = '2026-08-28' AND camp_id = 2), 'Kempe: Game', '16:15', '17:10', 'Rink');

-- Link Kempe Sessions
INSERT INTO SessionStreams (session_id, stream_id)
SELECT s.id, st.id
FROM Sessions s
JOIN CampDays cd ON s.camp_day_id = cd.id
JOIN Streams st ON st.camp_id = cd.camp_id AND (st.name = 'Group Kempe' OR st.name LIKE 'Kempe Group%')
WHERE s.name LIKE 'Kempe:%' AND cd.camp_id = 2;


-- ───────────────────────────────────────────────────────────────────────────
-- 4. GROUP NYLANDER (Wed 26 Aug - Fri 28 Aug 2026)
-- ───────────────────────────────────────────────────────────────────────────

-- Wed 26 Aug 2026 - Nylander
INSERT INTO Sessions (camp_day_id, name, start_time, end_time, location) VALUES
((SELECT id FROM CampDays WHERE date = '2026-08-26' AND camp_id = 2), 'Nylander: Arrive/registration', '07:30', '07:45', NULL),
((SELECT id FROM CampDays WHERE date = '2026-08-26' AND camp_id = 2), 'Nylander: Ice session', '08:15', '09:15', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2026-08-26' AND camp_id = 2), 'Nylander: Skills', '09:30', '10:30', 'Sports Hall'),
((SELECT id FROM CampDays WHERE date = '2026-08-26' AND camp_id = 2), 'Nylander: Activity (Team Building)', '11:00', '12:00', NULL),
((SELECT id FROM CampDays WHERE date = '2026-08-26' AND camp_id = 2), 'Nylander: Ice session', '12:15', '13:15', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2026-08-26' AND camp_id = 2), 'Nylander: Lunch', '13:30', '14:30', 'Cafeteria'),
((SELECT id FROM CampDays WHERE date = '2026-08-26' AND camp_id = 2), 'Nylander: Off Ice fitness', '14:45', '15:45', 'Outside'),
((SELECT id FROM CampDays WHERE date = '2026-08-26' AND camp_id = 2), 'Nylander: Game', '15:45', '16:15', 'Rink');

-- Thu 27 Aug 2026 - Nylander
INSERT INTO Sessions (camp_day_id, name, start_time, end_time, location) VALUES
((SELECT id FROM CampDays WHERE date = '2026-08-27' AND camp_id = 2), 'Nylander: Arrive/registration', '08:30', '08:45', NULL),
((SELECT id FROM CampDays WHERE date = '2026-08-27' AND camp_id = 2), 'Nylander: Ice session', '09:00', '10:00', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2026-08-27' AND camp_id = 2), 'Nylander: Skills', '10:30', '11:30', 'Sports Hall'),
((SELECT id FROM CampDays WHERE date = '2026-08-27' AND camp_id = 2), 'Nylander: Lunch', '11:30', '13:00', 'Cafeteria'),
((SELECT id FROM CampDays WHERE date = '2026-08-27' AND camp_id = 2), 'Nylander: Ice session', '13:15', '14:15', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2026-08-27' AND camp_id = 2), 'Nylander: Off Ice fitness', '14:30', '15:30', 'Outside'),
((SELECT id FROM CampDays WHERE date = '2026-08-27' AND camp_id = 2), 'Nylander: Activity (Team Building)', '15:45', '16:45', NULL),
((SELECT id FROM CampDays WHERE date = '2026-08-27' AND camp_id = 2), 'Nylander: Game', '17:20', '18:15', 'Rink');

-- Fri 28 Aug 2026 - Nylander
INSERT INTO Sessions (camp_day_id, name, start_time, end_time, location) VALUES
((SELECT id FROM CampDays WHERE date = '2026-08-28' AND camp_id = 2), 'Nylander: Arrive/registration', '08:30', '08:45', NULL),
((SELECT id FROM CampDays WHERE date = '2026-08-28' AND camp_id = 2), 'Nylander: Ice session', '09:00', '10:00', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2026-08-28' AND camp_id = 2), 'Nylander: Skills', '10:30', '11:30', 'Sports Hall'),
((SELECT id FROM CampDays WHERE date = '2026-08-28' AND camp_id = 2), 'Nylander: Lunch', '11:30', '13:00', 'Cafeteria'),
((SELECT id FROM CampDays WHERE date = '2026-08-28' AND camp_id = 2), 'Nylander: Ice session', '13:15', '14:15', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2026-08-28' AND camp_id = 2), 'Nylander: Activity', '14:30', '15:30', NULL),
((SELECT id FROM CampDays WHERE date = '2026-08-28' AND camp_id = 2), 'Nylander: Off Ice fitness', '15:45', '16:45', 'Outside'),
((SELECT id FROM CampDays WHERE date = '2026-08-28' AND camp_id = 2), 'Nylander: Game', '17:20', '18:15', 'Rink');

-- Link Nylander Sessions
INSERT INTO SessionStreams (session_id, stream_id)
SELECT s.id, st.id
FROM Sessions s
JOIN CampDays cd ON s.camp_day_id = cd.id
JOIN Streams st ON st.camp_id = cd.camp_id AND (st.name = 'Group Nylander' OR st.name LIKE 'Nylander Group%')
WHERE s.name LIKE 'Nylander:%' AND cd.camp_id = 2;
