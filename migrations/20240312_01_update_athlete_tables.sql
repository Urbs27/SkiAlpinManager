-- Alte Tabellen sichern (optional)
ALTER TABLE athletes RENAME TO athletes_old;
ALTER TABLE athlete_stats RENAME TO athlete_stats_old;

-- Neue Athletes Tabelle
CREATE TABLE athletes (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id),
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    nationality VARCHAR(3),
    license_id VARCHAR(10),
    birth_date DATE,
    height INTEGER,
    weight INTEGER,
    experience_years INTEGER,
    season_points INTEGER DEFAULT 0,
    world_rank INTEGER,
    overall_rating INTEGER,
    potential_rating INTEGER,
    contract_salary INTEGER,
    contract_end DATE,
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Neue Athlete Stats Tabelle
CREATE TABLE athlete_stats (
    id SERIAL PRIMARY KEY,
    athlete_id INTEGER REFERENCES athletes(id),
    
    -- Technische Fähigkeiten
    slalom_technik INTEGER,
    riesenslalom_technik INTEGER,
    super_g_technik INTEGER,
    abfahrt_technik INTEGER,
    
    -- Physische Grundfähigkeiten
    kraft INTEGER,
    explosivkraft INTEGER,
    ausdauer INTEGER,
    beweglichkeit INTEGER,
    
    -- Mentale Fähigkeiten
    mental_staerke INTEGER,
    risikobereitschaft INTEGER,
    stressresistenz INTEGER,
    konzentration INTEGER,
    
    -- Ski-spezifische Fähigkeiten
    kantentechnik INTEGER,
    gleittechnik INTEGER,
    sprungtechnik INTEGER,
    start_technik INTEGER,
    ziel_sprint INTEGER,
    
    -- Form
    form INTEGER,
    fitness INTEGER,
    ermuedung INTEGER,
    
    -- Disziplin-Ratings
    slalom_rating INTEGER,
    riesenslalom_rating INTEGER,
    super_g_rating INTEGER,
    abfahrt_rating INTEGER,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Neue Achievements Tabelle
CREATE TABLE athlete_achievements (
    id SERIAL PRIMARY KEY,
    athlete_id INTEGER REFERENCES athletes(id),
    season VARCHAR(9),
    competition_type VARCHAR(50),
    discipline VARCHAR(20),
    position INTEGER,
    race_points DECIMAL(6,2),
    season_points INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Neue Injuries Tabelle
CREATE TABLE athlete_injuries (
    id SERIAL PRIMARY KEY,
    athlete_id INTEGER REFERENCES athletes(id),
    injury_type VARCHAR(100),
    severity INTEGER,
    start_date DATE,
    expected_return_date DATE,
    actual_return_date DATE,
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daten aus alten Tabellen migrieren
INSERT INTO athletes (
    id, team_id, first_name, last_name, nationality,
    overall_rating, potential_rating, contract_salary,
    contract_end, status, created_at, updated_at
)
SELECT 
    id, team_id, first_name, last_name, nationality,
    overall_rating, potential_rating, contract_salary,
    contract_end, status, created_at, updated_at
FROM athletes_old;

-- Sequenz für id aktualisieren
SELECT setval('athletes_id_seq', (SELECT MAX(id) FROM athletes));

-- Stats migrieren und transformieren
INSERT INTO athlete_stats (
    athlete_id, kraft, ausdauer, mental_staerke,
    kantentechnik, gleittechnik, sprungtechnik,
    form, fitness, ermuedung
)
SELECT 
    athlete_id, kraft, ausdauer, mental,
    kantentechnik, gleittechnik, sprung_technik,
    form, fitness, müdigkeit
FROM athlete_stats_old;

-- Alte Tabellen droppen (optional)
-- DROP TABLE athletes_old;
-- DROP TABLE athlete_stats_old;

-- Indices für Performance
CREATE INDEX idx_athletes_team_id ON athletes(team_id);
CREATE INDEX idx_athlete_stats_athlete_id ON athlete_stats(athlete_id);
CREATE INDEX idx_achievements_athlete_id ON athlete_achievements(athlete_id);
CREATE INDEX idx_injuries_athlete_id ON athlete_injuries(athlete_id); 