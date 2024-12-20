-- Tracks Haupttabelle
CREATE TABLE tracks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    discipline TEXT NOT NULL, -- 'downhill', 'super_g', 'giant_slalom', 'slalom'
    length INTEGER NOT NULL, -- in Metern
    vertical_drop INTEGER NOT NULL, -- in Höhenmetern
    difficulty INTEGER NOT NULL, -- 1 (leicht) bis 3 (schwer)
    training_bonus TEXT, -- JSON mit Attributsboni
    section_data TEXT, -- JSON mit Streckensektionen
    weather_impact TEXT, -- JSON mit Wettereinflüssen
    min_time INTEGER DEFAULT 5, -- Minimale Trainingszeit in Minuten
    max_time INTEGER DEFAULT 30, -- Maximale Trainingszeit in Minuten
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Races Tabelle (Verknüpfung mit Tracks)
CREATE TABLE races (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    track_id INTEGER NOT NULL,
    date DATE NOT NULL,
    snow_condition INTEGER DEFAULT 100, -- 0 (schlecht) bis 100 (perfekt)
    weather TEXT, -- JSON mit Wetterbedingungen
    FOREIGN KEY (track_id) REFERENCES tracks(id)
);

-- Track Templates (Vorlagen für verschiedene Strecken)
CREATE TABLE track_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    discipline TEXT UNIQUE NOT NULL,
    base_length INTEGER NOT NULL,
    base_vertical_drop INTEGER NOT NULL,
    base_difficulty INTEGER NOT NULL,
    description TEXT
);

-- Initiale Daten für Track Templates
INSERT INTO track_templates 
(discipline, base_length, base_vertical_drop, base_difficulty, description) 
VALUES 
('downhill', 3000, 800, 3, 'Lange und anspruchsvolle Abfahrtsstrecke mit hohem Tempo'),
('super_g', 2000, 600, 2, 'Schnelle Super-G Strecke mit weiten Kurven'),
('giant_slalom', 1500, 400, 2, 'Technische Riesenslalomstrecke mit engen Kurven'),
('slalom', 800, 200, 1, 'Kurze und enge Slalomstrecke mit vielen Toren');

-- Indizes
CREATE INDEX idx_tracks_discipline ON tracks(discipline);
CREATE INDEX idx_races_track ON races(track_id);

-- Trigger für updated_at
CREATE TRIGGER update_tracks_timestamp 
AFTER UPDATE ON tracks
BEGIN
    UPDATE tracks 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
END; 