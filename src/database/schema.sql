CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    team_name TEXT,
    nationality TEXT,
    role TEXT DEFAULT 'user',
    status TEXT DEFAULT 'active',
    verified INTEGER DEFAULT 0,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
);

CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT NOT NULL,
    budget INTEGER DEFAULT 1000000,
    reputation INTEGER DEFAULT 50,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    nationality TEXT,
    FOREIGN KEY (team_id) REFERENCES teams(id)
);

CREATE TABLE IF NOT EXISTS competition_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER,
    rank INTEGER,
    FOREIGN KEY (player_id) REFERENCES players(id)
); 