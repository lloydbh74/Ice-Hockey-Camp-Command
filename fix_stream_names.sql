-- ═══════════════════════════════════════════════════════════════════════════
-- CLEANUP STREAMS & RE-LINK SESSIONS TO OFFICIAL STREAMS (Camp ID = 2)
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Remove session links to non-standard streams
DELETE FROM SessionStreams 
WHERE stream_id NOT IN (3, 4, 5, 6, 7);

-- 2. Delete non-standard extra streams for Camp 2
DELETE FROM Streams 
WHERE camp_id = 2 AND id NOT IN (3, 4, 5, 6, 7);

-- 3. Re-link Elite sessions to 'Advanced Elite (2008-2011)' (Stream ID 3)
INSERT OR IGNORE INTO SessionStreams (session_id, stream_id)
SELECT s.id, 3
FROM Sessions s
JOIN CampDays cd ON s.camp_day_id = cd.id
WHERE cd.camp_id = 2 AND s.name LIKE 'Elite:%';

-- 4. Re-link Pro sessions to 'Advanced Pro (2011-2015)' (Stream ID 4)
INSERT OR IGNORE INTO SessionStreams (session_id, stream_id)
SELECT s.id, 4
FROM Sessions s
JOIN CampDays cd ON s.camp_day_id = cd.id
WHERE cd.camp_id = 2 AND s.name LIKE 'Pro:%';

-- 5. Re-link Kempe sessions to 'Kempe Group (2014-2019)' (Stream ID 5)
INSERT OR IGNORE INTO SessionStreams (session_id, stream_id)
SELECT s.id, 5
FROM Sessions s
JOIN CampDays cd ON s.camp_day_id = cd.id
WHERE cd.camp_id = 2 AND s.name LIKE 'Kempe:%';

-- 6. Re-link Nylander sessions to 'Nylander Group (2011-2017)' (Stream ID 6)
INSERT OR IGNORE INTO SessionStreams (session_id, stream_id)
SELECT s.id, 6
FROM Sessions s
JOIN CampDays cd ON s.camp_day_id = cd.id
WHERE cd.camp_id = 2 AND s.name LIKE 'Nylander:%';
