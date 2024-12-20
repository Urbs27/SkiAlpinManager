-- Team Staff Haupttabelle
CREATE TABLE team_staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    name TEXT NOT NULL,
    quality INTEGER DEFAULT 50,
    salary INTEGER NOT NULL,
    contract_end DATE NOT NULL,
    experience INTEGER DEFAULT 0,
    specialization TEXT,
    nationality TEXT,
    birth_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id)
);

-- Staff Assignments (Zuweisungen)
CREATE TABLE staff_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id INTEGER NOT NULL,
    player_id INTEGER,
    facility_id INTEGER,
    assignment_type TEXT NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    effectiveness INTEGER DEFAULT 0,
    notes TEXT,
    FOREIGN KEY (staff_id) REFERENCES team_staff(id),
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (facility_id) REFERENCES team_facilities(id)
);

-- Staff Qualifikationen
CREATE TABLE staff_qualifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id INTEGER NOT NULL,
    qualification_type TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    acquired_date DATE NOT NULL,
    expiry_date DATE,
    issuer TEXT,
    description TEXT,
    FOREIGN KEY (staff_id) REFERENCES team_staff(id)
);

-- Staff Leistungshistorie
CREATE TABLE staff_performance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id INTEGER NOT NULL,
    performance_date DATE NOT NULL,
    rating INTEGER,
    success_rate REAL,
    players_improved INTEGER DEFAULT 0,
    notes TEXT,
    FOREIGN KEY (staff_id) REFERENCES team_staff(id)
);

-- Staff Templates (Vorlagen für verschiedene Rollen)
CREATE TABLE staff_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT UNIQUE NOT NULL,
    base_salary INTEGER NOT NULL,
    min_quality INTEGER DEFAULT 30,
    required_qualifications TEXT, -- JSON Array
    specializations TEXT,         -- JSON Array
    description TEXT
);

-- Initiale Daten für Staff Templates
INSERT INTO staff_templates 
(role, base_salary, min_quality, required_qualifications, specializations, description) 
VALUES 
('coach', 80000, 50, 
 '["FIS Coach License", "First Aid"]',
 '["Slalom", "Giant Slalom", "Super-G", "Downhill"]',
 'Haupttrainer für technische und strategische Entwicklung'),

('physiotherapist', 50000, 40,
 '["Sports Therapy License", "First Aid"]',
 '["Recovery", "Injury Prevention", "Performance Enhancement"]',
 'Physiotherapeut für Verletzungsprävention und Rehabilitation'),

('ski_technician', 45000, 45,
 '["Ski Service Certificate"]',
 '["Race Preparation", "Material Development"]',
 'Experte für Skiservice und Materialoptimierung'),

('analyst', 55000, 40,
 '["Sports Analysis Certificate", "Video Analysis"]',
 '["Technical Analysis", "Performance Analysis", "Competition Analysis"]',
 'Analyst für Technik- und Leistungsanalyse'),

('doctor', 90000, 60,
 '["Sports Medicine License", "Emergency Medicine"]',
 '["Sports Injuries", "Performance Medicine", "Rehabilitation"]',
 'Teamarzt für medizinische Betreuung und Gesundheitsmanagement'),

('manager', 70000, 50,
 '["Sports Management Certificate"]',
 '["Team Management", "Competition Planning", "Budget Management"]',
 'Manager für Organisation und Teamkoordination');

-- Staff Spezialisierungen
CREATE TABLE staff_specializations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id INTEGER NOT NULL,
    specialization TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    experience_points INTEGER DEFAULT 0,
    FOREIGN KEY (staff_id) REFERENCES team_staff(id)
);

-- Indizes
CREATE INDEX idx_staff_team ON team_staff(team_id);
CREATE INDEX idx_staff_role ON team_staff(role);
CREATE INDEX idx_assignments_staff ON staff_assignments(staff_id);
CREATE INDEX idx_assignments_player ON staff_assignments(player_id);
CREATE INDEX idx_assignments_facility ON staff_assignments(facility_id);
CREATE INDEX idx_qualifications_staff ON staff_qualifications(staff_id);
CREATE INDEX idx_performance_staff ON staff_performance(staff_id);
CREATE INDEX idx_specializations_staff ON staff_specializations(staff_id);

-- Trigger für updated_at
CREATE TRIGGER update_staff_timestamp 
AFTER UPDATE ON team_staff
BEGIN
    UPDATE team_staff 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
END; 