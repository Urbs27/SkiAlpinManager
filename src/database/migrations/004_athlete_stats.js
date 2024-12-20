const { pool } = require('../../config/database');

const up = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS athlete_stats (
                id SERIAL PRIMARY KEY,
                athlete_id INTEGER REFERENCES athletes(id),
                technik INTEGER NOT NULL DEFAULT 50 CHECK (technik BETWEEN 0 AND 100),
                kraft INTEGER NOT NULL DEFAULT 50 CHECK (kraft BETWEEN 0 AND 100),
                ausdauer INTEGER NOT NULL DEFAULT 50 CHECK (ausdauer BETWEEN 0 AND 100),
                mental INTEGER NOT NULL DEFAULT 50 CHECK (mental BETWEEN 0 AND 100),
                gleittechnik INTEGER NOT NULL DEFAULT 50 CHECK (gleittechnik BETWEEN 0 AND 100),
                kantentechnik INTEGER NOT NULL DEFAULT 50 CHECK (kantentechnik BETWEEN 0 AND 100),
                sprung_technik INTEGER NOT NULL DEFAULT 50 CHECK (sprung_technik BETWEEN 0 AND 100),
                form INTEGER NOT NULL DEFAULT 50 CHECK (form BETWEEN 0 AND 100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_athlete_stats_athlete_id ON athlete_stats(athlete_id);

            -- Trigger für updated_at
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';

            CREATE TRIGGER update_athlete_stats_updated_at
                BEFORE UPDATE ON athlete_stats
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);
    } catch (error) {
        console.error('Migration 004 fehlgeschlagen:', error);
        throw error;
    }
};

const down = async () => {
    try {
        await pool.query(`
            DROP TRIGGER IF EXISTS update_athlete_stats_updated_at ON athlete_stats;
            DROP FUNCTION IF EXISTS update_updated_at_column();
            DROP TABLE IF EXISTS athlete_stats CASCADE;
        `);
    } catch (error) {
        console.error('Migration 004 Rollback fehlgeschlagen:', error);
        throw error;
    }
};

module.exports = { up, down }; 