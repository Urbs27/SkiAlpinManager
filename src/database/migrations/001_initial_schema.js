const { pool } = require('../../config/database');

const up = async () => {
    try {
        // Erst alles löschen
        await pool.query(`
            DROP TRIGGER IF EXISTS update_athletes_updated_at ON athletes;
            DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
            DROP TRIGGER IF EXISTS update_users_updated_at ON users;
            DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
            DROP TABLE IF EXISTS athletes CASCADE;
            DROP TABLE IF EXISTS teams CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
        `);

        // Dann neu erstellen
        await pool.query(`
            -- Users
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Teams
            CREATE TABLE IF NOT EXISTS teams (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                country VARCHAR(3) NOT NULL,      -- ISO Alpha-3 Ländercode
                budget INTEGER NOT NULL DEFAULT 1000000,
                reputation INTEGER NOT NULL DEFAULT 50 CHECK (reputation BETWEEN 0 AND 100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Athletes
            CREATE TABLE IF NOT EXISTS athletes (
                id SERIAL PRIMARY KEY,
                team_id INTEGER REFERENCES teams(id),
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                nationality VARCHAR(3) NOT NULL,  -- ISO Alpha-3 Ländercode
                fis_code VARCHAR(20) UNIQUE,
                birth_date DATE NOT NULL,
                overall_rating INTEGER NOT NULL DEFAULT 50 CHECK (overall_rating BETWEEN 0 AND 100),
                potential_rating INTEGER NOT NULL DEFAULT 50 CHECK (potential_rating BETWEEN 0 AND 100),
                contract_salary INTEGER NOT NULL,
                contract_end DATE NOT NULL,
                status VARCHAR(20) DEFAULT 'active',  -- 'active', 'injured', 'retired'
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Indices
            CREATE INDEX IF NOT EXISTS idx_athletes_team_id ON athletes(team_id);
            CREATE INDEX IF NOT EXISTS idx_athletes_nationality ON athletes(nationality);

            -- Trigger-Funktion
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';

            -- Trigger
            CREATE TRIGGER update_users_updated_at
                BEFORE UPDATE ON users
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();

            CREATE TRIGGER update_teams_updated_at
                BEFORE UPDATE ON teams
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();

            CREATE TRIGGER update_athletes_updated_at
                BEFORE UPDATE ON athletes
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);
        
        console.log('Migration 001 erfolgreich ausgeführt');
    } catch (error) {
        console.error('Migration 001 fehlgeschlagen:', error);
        throw error;
    }
};

const down = async () => {
    try {
        await pool.query(`
            DROP TRIGGER IF EXISTS update_athletes_updated_at ON athletes;
            DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
            DROP TRIGGER IF EXISTS update_users_updated_at ON users;
            DROP FUNCTION IF EXISTS update_updated_at_column();
            DROP TABLE IF EXISTS athletes CASCADE;
            DROP TABLE IF EXISTS teams CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
        `);
        
        console.log('Migration 001 erfolgreich rückgängig gemacht');
    } catch (error) {
        console.error('Migration 001 Rollback fehlgeschlagen:', error);
        throw error;
    }
};

module.exports = {
    up,
    down
};