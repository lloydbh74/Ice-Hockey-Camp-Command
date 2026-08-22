-- 1. Ensure stream exists for active Camp (camp_id = 2)
INSERT OR IGNORE INTO Streams (camp_id, name, status)
VALUES (2, 'Elite Group', 'active');

-- 2. Insert Camp Days for Active Camp (camp_id = 2)
INSERT OR IGNORE INTO CampDays (camp_id, date, label, status) VALUES 
(2, '2025-08-17', 'Sunday 17th Aug', 'active'),
(2, '2025-08-18', 'Monday 18th Aug', 'active'),
(2, '2025-08-19', 'Tuesday 19th Aug', 'active');

-- Delete any previous sessions for camp_id = 2 on these dates to avoid duplicates
DELETE FROM Sessions 
WHERE camp_day_id IN (SELECT id FROM CampDays WHERE camp_id = 2 AND date IN ('2025-08-17', '2025-08-18', '2025-08-19'));

-- 3. Sunday 17th Aug Sessions (camp_id = 2)
INSERT INTO Sessions (camp_day_id, name, start_time, end_time, location) VALUES
((SELECT id FROM CampDays WHERE date = '2025-08-17' AND camp_id = 2), 'Registration/Arrive', '08:00', '08:30', NULL),
((SELECT id FROM CampDays WHERE date = '2025-08-17' AND camp_id = 2), 'Ice session', '08:50', '09:45', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2025-08-17' AND camp_id = 2), 'Skills', '10:00', '11:00', 'Sports Hall'),
((SELECT id FROM CampDays WHERE date = '2025-08-17' AND camp_id = 2), 'Activity', '11:15', '12:15', NULL),
((SELECT id FROM CampDays WHERE date = '2025-08-17' AND camp_id = 2), 'Lunch', '12:15', '13:00', 'Cafeteria'),
((SELECT id FROM CampDays WHERE date = '2025-08-17' AND camp_id = 2), 'Ice session', '13:20', '14:15', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2025-08-17' AND camp_id = 2), 'Off Ice fitness', '15:00', '16:00', 'Outside'),
((SELECT id FROM CampDays WHERE date = '2025-08-17' AND camp_id = 2), 'Video session', '16:10', '17:00', 'Studio'),
((SELECT id FROM CampDays WHERE date = '2025-08-17' AND camp_id = 2), 'Short Game', '17:45', '18:30', 'Rink');

-- 4. Monday 18th Aug Sessions (camp_id = 2)
INSERT INTO Sessions (camp_day_id, name, start_time, end_time, location) VALUES
((SELECT id FROM CampDays WHERE date = '2025-08-18' AND camp_id = 2), 'Arrive', '07:30', '07:45', NULL),
((SELECT id FROM CampDays WHERE date = '2025-08-18' AND camp_id = 2), 'Ice session', '08:20', '09:15', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2025-08-18' AND camp_id = 2), 'Skills', '09:30', '10:30', 'Sports Hall'),
((SELECT id FROM CampDays WHERE date = '2025-08-18' AND camp_id = 2), 'Off Ice fitness', '10:45', '11:45', 'Outside/warm-up'),
((SELECT id FROM CampDays WHERE date = '2025-08-18' AND camp_id = 2), 'Ice session', '12:20', '13:15', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2025-08-18' AND camp_id = 2), 'Lunch', '13:15', '14:15', 'Cafeteria'),
((SELECT id FROM CampDays WHERE date = '2025-08-18' AND camp_id = 2), 'Gym session', '14:30', '15:30', 'Gym'),
((SELECT id FROM CampDays WHERE date = '2025-08-18' AND camp_id = 2), 'Game', '16:20', '17:15', 'Rink');

-- 5. Tuesday 19th Aug Sessions (camp_id = 2)
INSERT INTO Sessions (camp_day_id, name, start_time, end_time, location) VALUES
((SELECT id FROM CampDays WHERE date = '2025-08-19' AND camp_id = 2), 'Arrive', '08:30', '08:30', NULL),
((SELECT id FROM CampDays WHERE date = '2025-08-19' AND camp_id = 2), 'Ice session', '09:05', '10:00', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2025-08-19' AND camp_id = 2), 'Skills', '10:30', '11:30', 'Sports Hall'),
((SELECT id FROM CampDays WHERE date = '2025-08-19' AND camp_id = 2), 'Break / Lunch', '11:45', '12:45', 'Cafeteria'),
((SELECT id FROM CampDays WHERE date = '2025-08-19' AND camp_id = 2), 'Ice session', '13:15', '14:15', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2025-08-19' AND camp_id = 2), 'Video session', '14:45', '15:30', 'Studio'),
((SELECT id FROM CampDays WHERE date = '2025-08-19' AND camp_id = 2), 'Game', '16:00', '17:15', 'Rink');

-- 6. Link Sessions to both "Advanced Elite (2008-2011)" and "Elite Group" streams for camp_id = 2
INSERT INTO SessionStreams (session_id, stream_id)
SELECT s.id, st.id
FROM Sessions s
JOIN CampDays cd ON s.camp_day_id = cd.id
JOIN Streams st ON st.camp_id = cd.camp_id AND (st.name = 'Elite Group' OR st.name LIKE 'Advanced Elite%')
WHERE cd.date IN ('2025-08-17', '2025-08-18', '2025-08-19')
  AND cd.camp_id = 2;
