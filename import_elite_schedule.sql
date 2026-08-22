-- 1. Ensure stream exists
INSERT OR IGNORE INTO Streams (camp_id, name, status)
VALUES (1, 'Elite Group', 'active');

-- 2. Insert Camp Days
INSERT OR IGNORE INTO CampDays (camp_id, date, label, status) VALUES 
(1, '2025-08-17', 'Sunday 17th Aug', 'active'),
(1, '2025-08-18', 'Monday 18th Aug', 'active'),
(1, '2025-08-19', 'Tuesday 19th Aug', 'active');

-- 3. Sunday 17th Aug Sessions
INSERT INTO Sessions (camp_day_id, name, start_time, end_time, location) VALUES
((SELECT id FROM CampDays WHERE date = '2025-08-17' AND camp_id = 1), 'Registration/Arrive', '08:00', '08:30', NULL),
((SELECT id FROM CampDays WHERE date = '2025-08-17' AND camp_id = 1), 'Ice session', '08:50', '09:45', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2025-08-17' AND camp_id = 1), 'Skills', '10:00', '11:00', 'Sports Hall'),
((SELECT id FROM CampDays WHERE date = '2025-08-17' AND camp_id = 1), 'Activity', '11:15', '12:15', NULL),
((SELECT id FROM CampDays WHERE date = '2025-08-17' AND camp_id = 1), 'Lunch', '12:15', '13:00', 'Cafeteria'),
((SELECT id FROM CampDays WHERE date = '2025-08-17' AND camp_id = 1), 'Ice session', '13:20', '14:15', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2025-08-17' AND camp_id = 1), 'Off Ice fitness', '15:00', '16:00', 'Outside'),
((SELECT id FROM CampDays WHERE date = '2025-08-17' AND camp_id = 1), 'Video session', '16:10', '17:00', 'Studio'),
((SELECT id FROM CampDays WHERE date = '2025-08-17' AND camp_id = 1), 'Short Game', '17:45', '18:30', 'Rink');

-- 4. Monday 18th Aug Sessions
INSERT INTO Sessions (camp_day_id, name, start_time, end_time, location) VALUES
((SELECT id FROM CampDays WHERE date = '2025-08-18' AND camp_id = 1), 'Arrive', '07:30', '07:45', NULL),
((SELECT id FROM CampDays WHERE date = '2025-08-18' AND camp_id = 1), 'Ice session', '08:20', '09:15', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2025-08-18' AND camp_id = 1), 'Skills', '09:30', '10:30', 'Sports Hall'),
((SELECT id FROM CampDays WHERE date = '2025-08-18' AND camp_id = 1), 'Off Ice fitness', '10:45', '11:45', 'Outside/warm-up'),
((SELECT id FROM CampDays WHERE date = '2025-08-18' AND camp_id = 1), 'Ice session', '12:20', '13:15', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2025-08-18' AND camp_id = 1), 'Lunch', '13:15', '14:15', 'Cafeteria'),
((SELECT id FROM CampDays WHERE date = '2025-08-18' AND camp_id = 1), 'Gym session', '14:30', '15:30', 'Gym'),
((SELECT id FROM CampDays WHERE date = '2025-08-18' AND camp_id = 1), 'Game', '16:20', '17:15', 'Rink');

-- 5. Tuesday 19th Aug Sessions
INSERT INTO Sessions (camp_day_id, name, start_time, end_time, location) VALUES
((SELECT id FROM CampDays WHERE date = '2025-08-19' AND camp_id = 1), 'Arrive', '08:30', '08:30', NULL),
((SELECT id FROM CampDays WHERE date = '2025-08-19' AND camp_id = 1), 'Ice session', '09:05', '10:00', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2025-08-19' AND camp_id = 1), 'Skills', '10:30', '11:30', 'Sports Hall'),
((SELECT id FROM CampDays WHERE date = '2025-08-19' AND camp_id = 1), 'Break / Lunch', '11:45', '12:45', 'Cafeteria'),
((SELECT id FROM CampDays WHERE date = '2025-08-19' AND camp_id = 1), 'Ice session', '13:15', '14:15', 'Rink'),
((SELECT id FROM CampDays WHERE date = '2025-08-19' AND camp_id = 1), 'Video session', '14:45', '15:30', 'Studio'),
((SELECT id FROM CampDays WHERE date = '2025-08-19' AND camp_id = 1), 'Game', '16:00', '17:15', 'Rink');

-- 6. Link Sessions to Elite Group Stream
INSERT INTO SessionStreams (session_id, stream_id)
SELECT s.id, st.id
FROM Sessions s
JOIN CampDays cd ON s.camp_day_id = cd.id
JOIN Streams st ON st.name = 'Elite Group' AND st.camp_id = cd.camp_id
WHERE cd.date IN ('2025-08-17', '2025-08-18', '2025-08-19')
  AND cd.camp_id = 1;
