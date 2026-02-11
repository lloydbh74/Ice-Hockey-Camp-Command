-- Initialize Camp Day Planner tables if they don't exist
-- This script is safe to run multiple times

CREATE TABLE IF NOT EXISTS CampDays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    camp_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    label TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    FOREIGN KEY (camp_id) REFERENCES Camps(id)
);

CREATE TABLE IF NOT EXISTS Streams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    camp_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    FOREIGN KEY (camp_id) REFERENCES Camps(id)
);

CREATE TABLE IF NOT EXISTS Sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    camp_day_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    location TEXT,
    FOREIGN KEY (camp_day_id) REFERENCES CampDays(id)
);

CREATE TABLE IF NOT EXISTS SessionStreams (
    session_id INTEGER NOT NULL,
    stream_id INTEGER NOT NULL,
    PRIMARY KEY (session_id, stream_id),
    FOREIGN KEY (session_id) REFERENCES Sessions(id),
    FOREIGN KEY (stream_id) REFERENCES Streams(id)
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_camp_days_camp_id ON CampDays(camp_id);
CREATE INDEX IF NOT EXISTS idx_streams_camp_id ON Streams(camp_id);
CREATE INDEX IF NOT EXISTS idx_sessions_camp_day_id ON Sessions(camp_day_id);
