const { pool } = require('../../config/database');

const up = async () => {
    try {
        await pool.query(`
            -- Facilities
            CREATE TABLE IF NOT EXISTS facilities (
                id SERIAL PRIMARY KEY,
                team_id INTEGER REFERENCES teams(id),
                name VARCHAR(100) NOT NULL,
                type VARCHAR(50) NOT NULL,
                capacity INTEGER,
                status VARCHAR(20) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Staff
            CREATE TABLE IF NOT EXISTS staff (
                id SERIAL PRIMARY KEY,
                team_id INTEGER REFERENCES teams(id),
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                role VARCHAR(50) NOT NULL,
                hire_date DATE NOT NULL,
                contract_end DATE,
                status VARCHAR(20) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Races
            CREATE TABLE IF NOT EXISTS races (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                location VARCHAR(100) NOT NULL,
                date DATE NOT NULL,
                discipline VARCHAR(20) NOT NULL,
                category VARCHAR(50) NOT NULL,
                status VARCHAR(20) DEFAULT 'scheduled',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Race Results
            CREATE TABLE IF NOT EXISTS race_results (
                id SERIAL PRIMARY KEY,
                race_id INTEGER REFERENCES races(id),
                athlete_id INTEGER REFERENCES athletes(id),
                start_number INTEGER,
                run1_time DECIMAL(10,3),
                run2_time DECIMAL(10,3),
                final_time DECIMAL(10,3),
                rank INTEGER,
                fis_points DECIMAL(10,2),
                status VARCHAR(20) DEFAULT 'registered',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Indices für Basistabellen
            CREATE INDEX IF NOT EXISTS idx_facilities_team_id ON facilities(team_id);
            CREATE INDEX IF NOT EXISTS idx_staff_team_id ON staff(team_id);
            CREATE INDEX IF NOT EXISTS idx_race_results_race_id ON race_results(race_id);
        `);
        
        console.log('Migration 002 erfolgreich ausgeführt');
    } catch (error) {
        console.error('Migration 002 fehlgeschlagen:', error);
        throw error;
    }
};

const down = async () => {
    try {
        await pool.query(`
            DROP TABLE IF EXISTS race_results CASCADE;
            DROP TABLE IF EXISTS races CASCADE;
            DROP TABLE IF EXISTS staff CASCADE;
            DROP TABLE IF EXISTS facilities CASCADE;
        `);
        
        console.log('Migration 002 erfolgreich rückgängig gemacht');
    } catch (error) {
        console.error('Migration 002 Rollback fehlgeschlagen:', error);
        throw error;
    }
};

module.exports = {
    up,
    down
}; 