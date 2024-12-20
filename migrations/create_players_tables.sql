-- Players Tabelle
CREATE TABLE players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    nationality TEXT NOT NULL,
    fis_code TEXT UNIQUE,          -- Eindeutiger FIS-Code
    birth_date DATE NOT NULL,
    overall_rating INTEGER,
    potential_rating INTEGER,
    contract_salary INTEGER,
    contract_end DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id)
);

-- Player Stats Tabelle
CREATE TABLE player_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER UNIQUE,
    -- Basis Attribute
    technik INTEGER DEFAULT 50,      -- Allgemeine Technik
    kraft INTEGER DEFAULT 50,        -- Körperliche Kraft
    ausdauer INTEGER DEFAULT 50,     -- Ausdauer
    mental INTEGER DEFAULT 50,       -- Mentale Stärke
    
    -- Spezifische Ski-Attribute
    gleittechnik INTEGER DEFAULT 50, -- Gleitfähigkeit
    kantentechnik INTEGER DEFAULT 50,-- Kantenkontrolle
    sprung_technik INTEGER DEFAULT 50,-- Sprungtechnik
    
    -- Dynamische Attribute
    form INTEGER DEFAULT 50,         -- Aktuelle Form
    fitness INTEGER DEFAULT 100,     -- Fitness/Gesundheit
    muedigkeit INTEGER DEFAULT 0,    -- Müdigkeitsgrad
    
    -- Disziplin-spezifische Attribute
    dh_skill INTEGER DEFAULT 50,     -- Abfahrt-Fähigkeit
    sg_skill INTEGER DEFAULT 50,     -- Super-G-Fähigkeit
    gs_skill INTEGER DEFAULT 50,     -- Riesenslalom-Fähigkeit
    sl_skill INTEGER DEFAULT 50,     -- Slalom-Fähigkeit
    
    -- Spezielle Fähigkeiten
    start_technik INTEGER DEFAULT 50,-- Starttechnik
    ziel_sprint INTEGER DEFAULT 50,  -- Zielsprint
    kurven_technik INTEGER DEFAULT 50,-- Kurventechnik
    risiko_bereit INTEGER DEFAULT 50,-- Risikobereitschaft
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id)
);

-- Player History Tabelle für Statistiken
CREATE TABLE player_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER,
    season TEXT,                     -- Saison (z.B. "2023/24")
    competition_count INTEGER DEFAULT 0,
    podiums INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    dnf_count INTEGER DEFAULT 0,     -- Did Not Finish
    best_rank INTEGER,
    total_points INTEGER DEFAULT 0,
    avg_fis_points REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id)
);

-- Player Injuries Tabelle
CREATE TABLE player_injuries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER,
    injury_type TEXT,               -- Art der Verletzung
    severity INTEGER,               -- Schweregrad (1-5)
    start_date DATE,
    expected_return_date DATE,
    actual_return_date DATE,
    status TEXT,                    -- 'active', 'recovered'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id)
);

-- Indizes für bessere Performance
CREATE INDEX idx_players_team ON players(team_id);
CREATE INDEX idx_players_fis ON players(fis_code);
CREATE INDEX idx_player_stats_player ON player_stats(player_id);
CREATE INDEX idx_player_history_player ON player_history(player_id);
CREATE INDEX idx_player_injuries_player ON player_injuries(player_id); 