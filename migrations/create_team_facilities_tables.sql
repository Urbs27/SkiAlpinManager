-- Team Facilities Haupttabelle
CREATE TABLE team_facilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER NOT NULL,
    facility_type TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    condition INTEGER DEFAULT 100,
    capacity INTEGER NOT NULL,
    efficiency INTEGER DEFAULT 100,
    technology_level INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id),
    UNIQUE(team_id, facility_type)
);

-- Wartungsprotokoll
CREATE TABLE facility_maintenance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    facility_id INTEGER NOT NULL,
    maintenance_type TEXT NOT NULL, -- 'maintenance' oder 'upgrade'
    cost INTEGER NOT NULL,
    maintenance_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    performed_by TEXT,
    FOREIGN KEY (facility_id) REFERENCES team_facilities(id)
);

-- Einrichtungsnutzung
CREATE TABLE facility_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    facility_id INTEGER NOT NULL,
    player_id INTEGER NOT NULL,
    usage_type TEXT NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    effectiveness INTEGER, -- Effektivität der Nutzung (0-100)
    notes TEXT,
    FOREIGN KEY (facility_id) REFERENCES team_facilities(id),
    FOREIGN KEY (player_id) REFERENCES players(id)
);

-- Einrichtungs-Upgrades Historie
CREATE TABLE facility_upgrades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    facility_id INTEGER NOT NULL,
    upgrade_type TEXT NOT NULL,
    old_level INTEGER NOT NULL,
    new_level INTEGER NOT NULL,
    cost INTEGER NOT NULL,
    upgrade_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES team_facilities(id)
);

-- Einrichtungs-Effekte
CREATE TABLE facility_effects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    facility_id INTEGER NOT NULL,
    effect_type TEXT NOT NULL,
    attribute_affected TEXT NOT NULL,
    effect_value INTEGER NOT NULL,
    duration INTEGER, -- in Stunden, NULL für permanent
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES team_facilities(id)
);

-- Standard-Einrichtungen
CREATE TABLE facility_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    facility_type TEXT UNIQUE NOT NULL,
    base_cost INTEGER NOT NULL,
    base_capacity INTEGER NOT NULL,
    maintenance_interval INTEGER NOT NULL, -- in Tagen
    upgrade_multiplier REAL DEFAULT 1.5,
    description TEXT,
    requirements TEXT -- JSON mit Voraussetzungen
);

-- Initiale Daten für Einrichtungs-Templates
INSERT INTO facility_templates 
(facility_type, base_cost, base_capacity, maintenance_interval, description) 
VALUES 
('ski_service', 200000, 10, 7, 'Professionelle Skiservice-Werkstatt für Wartung und Optimierung'),
('training_slope', 500000, 15, 14, 'Privater Trainingshang mit verschiedenen Streckenprofilen'),
('gym', 150000, 20, 30, 'Moderner Kraftraum mit speziellem Ski-Trainingsequipment'),
('medical', 300000, 5, 30, 'Medizinische Einrichtung für Behandlung und Prävention'),
('recovery', 200000, 8, 14, 'Regenerationsbereich mit Sauna, Eisbad und Physiotherapie'),
('analysis', 250000, 12, 30, 'Videoanalyse-Zentrum mit modernster Technik'),
('lodge', 400000, 25, 60, 'Mannschaftsunterkunft für optimale Regeneration');

-- Indizes
CREATE INDEX idx_facilities_team ON team_facilities(team_id);
CREATE INDEX idx_maintenance_facility ON facility_maintenance(facility_id);
CREATE INDEX idx_usage_facility ON facility_usage(facility_id);
CREATE INDEX idx_usage_player ON facility_usage(player_id);
CREATE INDEX idx_upgrades_facility ON facility_upgrades(facility_id);
CREATE INDEX idx_effects_facility ON facility_effects(facility_id);

-- Trigger für updated_at
CREATE TRIGGER update_facilities_timestamp 
AFTER UPDATE ON team_facilities
BEGIN
    UPDATE team_facilities 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
END; 