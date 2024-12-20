const { pool } = require('../../config/database');

const up = async () => {
    try {
        await pool.query(`
            -- Training Sessions
            CREATE TABLE IF NOT EXISTS training_sessions (
                id SERIAL PRIMARY KEY,
                team_id INTEGER REFERENCES teams(id),
                facility_id INTEGER REFERENCES facilities(id),
                coach_id INTEGER REFERENCES staff(id),
                date DATE NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                type VARCHAR(50) NOT NULL,  -- z.B. 'technique', 'fitness', 'race_simulation'
                status VARCHAR(20) DEFAULT 'scheduled',
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Training Attendance
            CREATE TABLE IF NOT EXISTS training_attendance (
                id SERIAL PRIMARY KEY,
                training_id INTEGER REFERENCES training_sessions(id),
                athlete_id INTEGER REFERENCES athletes(id),
                status VARCHAR(20) DEFAULT 'present',  -- 'present', 'absent', 'injured'
                performance_rating INTEGER CHECK (performance_rating BETWEEN 1 AND 10),
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Equipment
            CREATE TABLE IF NOT EXISTS equipment (
                id SERIAL PRIMARY KEY,
                athlete_id INTEGER REFERENCES athletes(id),
                type VARCHAR(50) NOT NULL,  -- z.B. 'ski', 'boots', 'poles'
                brand VARCHAR(50),
                model VARCHAR(100),
                purchase_date DATE,
                status VARCHAR(20) DEFAULT 'active',  -- 'active', 'maintenance', 'retired'
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Equipment Maintenance
            CREATE TABLE IF NOT EXISTS equipment_maintenance (
                id SERIAL PRIMARY KEY,
                equipment_id INTEGER REFERENCES equipment(id),
                maintenance_date DATE NOT NULL,
                type VARCHAR(50) NOT NULL,  -- z.B. 'repair', 'tuning', 'inspection'
                cost DECIMAL(10,2),
                performed_by VARCHAR(100),
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        console.log('Migration 003 erfolgreich ausgeführt');
    } catch (error) {
        console.error('Migration 003 fehlgeschlagen:', error);
        throw error;
    }
};

const down = async () => {
    try {
        await pool.query(`
            DROP TABLE IF EXISTS equipment_maintenance CASCADE;
            DROP TABLE IF EXISTS equipment CASCADE;
            DROP TABLE IF EXISTS training_attendance CASCADE;
            DROP TABLE IF EXISTS training_sessions CASCADE;
        `);
        
        console.log('Migration 003 erfolgreich rückgängig gemacht');
    } catch (error) {
        console.error('Migration 003 Rollback fehlgeschlagen:', error);
        throw error;
    }
};

module.exports = {
    up,
    down
}; 