const { pool } = require('../config/database');

const initializeDatabase = async () => {
    try {
        // Users-Tabelle
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                team_name VARCHAR(255),
                nationality VARCHAR(50),
                role VARCHAR(50) DEFAULT 'user',
                status VARCHAR(50) DEFAULT 'active',
                verified BOOLEAN DEFAULT FALSE,
                last_login TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Players-Tabelle
        await pool.query(`
            CREATE TABLE IF NOT EXISTS players (
                id SERIAL PRIMARY KEY,
                team_id INTEGER REFERENCES teams(id),
                first_name VARCHAR(255) NOT NULL,
                last_name VARCHAR(255) NOT NULL,
                nationality VARCHAR(50) NOT NULL,
                birth_date DATE,
                fis_code VARCHAR(50) UNIQUE,
                status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Player Stats-Tabelle
        await pool.query(`
            CREATE TABLE IF NOT EXISTS player_stats (
                id SERIAL PRIMARY KEY,
                player_id INTEGER NOT NULL REFERENCES players(id),
                technik INTEGER DEFAULT 50,
                kraft INTEGER DEFAULT 50,
                ausdauer INTEGER DEFAULT 50,
                mental INTEGER DEFAULT 50,
                gleittechnik INTEGER DEFAULT 50,
                kantentechnik INTEGER DEFAULT 50,
                sprung_technik INTEGER DEFAULT 50,
                form INTEGER DEFAULT 50,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Datenbank-Tabellen wurden initialisiert');
    } catch (error) {
        console.error('Fehler bei der Datenbank-Initialisierung:', error);
        throw error;
    }
};

module.exports = {
    initializeDatabase
}; 