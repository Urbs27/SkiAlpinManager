-- Teams/Verbände
CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    nationality TEXT NOT NULL,
    budget INTEGER DEFAULT 1000000,
    reputation INTEGER DEFAULT 50,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Athleten
CREATE TABLE IF NOT EXISTS athletes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    nationality TEXT NOT NULL,
    birth_date DATE NOT NULL,
    height INTEGER,  -- in cm
    weight INTEGER,  -- in kg
    
    -- Technische Fähigkeiten
    slalom_rating INTEGER DEFAULT 50,
    giant_slalom_rating INTEGER DEFAULT 50,
    super_g_rating INTEGER DEFAULT 50,
    downhill_rating INTEGER DEFAULT 50,
    
    -- Physische Attribute
    strength INTEGER DEFAULT 50,      -- Kraft
    endurance INTEGER DEFAULT 50,     -- Ausdauer
    agility INTEGER DEFAULT 50,       -- Beweglichkeit
    balance INTEGER DEFAULT 50,       -- Balance
    
    -- Status
    fitness_level INTEGER DEFAULT 100,
    injury_status TEXT DEFAULT 'fit',
    form INTEGER DEFAULT 50,          -- Aktuelle Form
    
    -- Vertrag
    salary INTEGER NOT NULL,
    contract_start DATE NOT NULL,
    contract_end DATE NOT NULL,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id)
);

-- Equipment
CREATE TABLE IF NOT EXISTS equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    athlete_id INTEGER NOT NULL,
    ski_brand TEXT NOT NULL,
    ski_model TEXT NOT NULL,
    ski_length INTEGER NOT NULL,      -- in cm
    binding_brand TEXT NOT NULL,
    boot_brand TEXT NOT NULL,
    condition INTEGER DEFAULT 100,     -- Materialzustand
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (athlete_id) REFERENCES athletes(id)
);

-- Saisonkalender
CREATE TABLE IF NOT EXISTS season_calendar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    country TEXT NOT NULL,
    discipline TEXT NOT NULL CHECK(discipline IN ('SL','GS','SG','DH')),
    category TEXT NOT NULL CHECK(category IN ('WC','EC','FIS')), -- Weltcup, Europacup, FIS
    prize_money INTEGER DEFAULT 0,
    altitude_start INTEGER NOT NULL,  -- Starthöhe
    altitude_finish INTEGER NOT NULL, -- Zielhöhe
    length INTEGER NOT NULL,          -- Streckenlänge
    gates INTEGER NOT NULL,           -- Anzahl Tore
    date DATE NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled','in_progress','completed','cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Wettkämpfe
CREATE TABLE IF NOT EXISTS competitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    calendar_id INTEGER NOT NULL,
    weather_conditions TEXT,
    snow_conditions TEXT,
    temperature REAL,
    wind_speed REAL,
    visibility TEXT,
    status TEXT DEFAULT 'preparation' CHECK(status IN ('preparation','inspection','training','qualification','race','completed','cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (calendar_id) REFERENCES season_calendar(id)
);

-- Rennergebnisse
CREATE TABLE IF NOT EXISTS competition_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    competition_id INTEGER NOT NULL,
    athlete_id INTEGER NOT NULL,
    bib_number INTEGER NOT NULL,
    start_position INTEGER NOT NULL,
    run1_time REAL,
    run2_time REAL,
    total_time REAL,
    world_cup_points INTEGER DEFAULT 0,
    prize_money INTEGER DEFAULT 0,
    status TEXT DEFAULT 'DNS' CHECK(status IN ('DNS','DNF','DSQ','finished')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (competition_id) REFERENCES competitions(id),
    FOREIGN KEY (athlete_id) REFERENCES athletes(id)
);

-- Zwischenzeiten
CREATE TABLE IF NOT EXISTS split_times (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    result_id INTEGER NOT NULL,
    split_number INTEGER NOT NULL,
    split_time REAL NOT NULL,
    split_rank INTEGER,
    split_diff REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (result_id) REFERENCES competition_results(id)
);

-- Training/Vorbereitung
CREATE TABLE IF NOT EXISTS training_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    athlete_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('conditioning','technique','race_simulation','recovery')),
    duration INTEGER NOT NULL, -- in Minuten
    intensity INTEGER CHECK(intensity BETWEEN 1 AND 10),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (athlete_id) REFERENCES athletes(id)
);

-- Verletzungen/Ausfälle
CREATE TABLE IF NOT EXISTS injuries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    athlete_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    severity TEXT CHECK(severity IN ('minor','moderate','severe')),
    start_date DATE NOT NULL,
    expected_recovery_date DATE,
    actual_recovery_date DATE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (athlete_id) REFERENCES athletes(id)
); 