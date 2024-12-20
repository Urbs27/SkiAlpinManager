-- Users Haupttabelle
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    team_name TEXT NOT NULL,
    nationality TEXT,
    role TEXT DEFAULT 'user', -- 'user', 'admin', 'moderator'
    status TEXT DEFAULT 'active', -- 'active', 'inactive', 'banned'
    last_login TIMESTAMP,
    login_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Settings
CREATE TABLE user_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    language TEXT DEFAULT 'de',
    theme TEXT DEFAULT 'light',
    notifications BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    auto_pause BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- User Statistics
CREATE TABLE user_statistics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_races INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    total_podiums INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    best_rank INTEGER,
    worst_rank INTEGER,
    avg_rank REAL,
    total_training_sessions INTEGER DEFAULT 0,
    total_training_hours INTEGER DEFAULT 0,
    total_injuries INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- User Achievements
CREATE TABLE user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    achievement_type TEXT NOT NULL,
    achievement_data TEXT, -- JSON mit Details
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- User Login History
CREATE TABLE user_login_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- User Action Log
CREATE TABLE user_action_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action_type TEXT NOT NULL,
    action_data TEXT, -- JSON mit Details
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indizes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_settings_user ON user_settings(user_id);
CREATE INDEX idx_statistics_user ON user_statistics(user_id);
CREATE INDEX idx_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_login_history_user ON user_login_history(user_id);
CREATE INDEX idx_action_log_user ON user_action_log(user_id);

-- Trigger für Login Count
CREATE TRIGGER increment_login_count 
AFTER INSERT ON user_login_history
WHEN NEW.success = 1
BEGIN
    UPDATE users 
    SET login_count = login_count + 1,
        last_login = NEW.login_time
    WHERE id = NEW.user_id;
END;

-- Trigger für updated_at
CREATE TRIGGER update_users_timestamp 
AFTER UPDATE ON users
BEGIN
    UPDATE users 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
END;

CREATE TRIGGER update_settings_timestamp 
AFTER UPDATE ON user_settings
BEGIN
    UPDATE user_settings 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
END;

CREATE TRIGGER update_statistics_timestamp 
AFTER UPDATE ON user_statistics
BEGIN
    UPDATE user_statistics 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
END;

-- Automatische Erstellung von Einträgen für neue Benutzer
CREATE TRIGGER create_user_related_entries 
AFTER INSERT ON users
BEGIN
    INSERT INTO user_settings (user_id) VALUES (NEW.id);
    INSERT INTO user_statistics (user_id) VALUES (NEW.id);
END; 