-- Create CampDays table
CREATE TABLE CampDays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    camp_id INTEGER NOT NULL,
    date TEXT NOT NULL, -- Stored as ISO8601 YYYY-MM-DD
    label TEXT,         -- e.g., "Day 1", "Friday"
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    FOREIGN KEY (camp_id) REFERENCES Camps(id)
);

-- Create Streams table
CREATE TABLE Streams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    camp_id INTEGER NOT NULL,
    name TEXT NOT NULL, -- e.g., "9–14 Elite", "Seniors"
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    FOREIGN KEY (camp_id) REFERENCES Camps(id)
);

-- Create Sessions table
CREATE TABLE Sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    camp_day_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    start_time TEXT NOT NULL, -- format "HH:MM"
    end_time TEXT NOT NULL,   -- format "HH:MM"
    location TEXT,
    FOREIGN KEY (camp_day_id) REFERENCES CampDays(id)
);

-- Create SessionStreams join table
CREATE TABLE SessionStreams (
    session_id INTEGER NOT NULL,
    stream_id INTEGER NOT NULL,
    PRIMARY KEY (session_id, stream_id),
    FOREIGN KEY (session_id) REFERENCES Sessions(id),
    FOREIGN KEY (stream_id) REFERENCES Streams(id)
);

-- Create Indexes for performance
CREATE INDEX idx_camp_days_camp_id ON CampDays(camp_id);
CREATE INDEX idx_streams_camp_id ON Streams(camp_id);
CREATE INDEX idx_sessions_camp_day_id ON Sessions(camp_day_id);
