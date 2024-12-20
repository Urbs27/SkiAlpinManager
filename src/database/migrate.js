const fs = require('fs').promises;
const path = require('path');
const { pool } = require('../config/database');

const createMigrationsTable = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS migrations (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
};

const getExecutedMigrations = async () => {
    const result = await pool.query('SELECT name FROM migrations ORDER BY executed_at');
    return new Set(result.rows.map(row => row.name));
};

const getMigrationStatus = async () => {
    const executedMigrations = await getExecutedMigrations();
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = await fs.readdir(migrationsDir);
    
    const migrations = files
        .filter(f => f.endsWith('.js'))
        .sort()
        .map(file => ({
            name: file,
            executed: executedMigrations.has(file)
        }));

    console.log('\nMigrations-Status:');
    console.log('------------------');
    migrations.forEach(m => {
        console.log(`${m.executed ? '✓' : '✗'} ${m.name}`);
    });
};

const undoLastMigration = async () => {
    const result = await pool.query(
        'SELECT name FROM migrations ORDER BY executed_at DESC LIMIT 1'
    );
    
    if (result.rows.length === 0) {
        console.log('Keine Migrationen zum Rückgängig machen');
        return;
    }

    const lastMigration = result.rows[0].name;
    const migration = require(path.join(__dirname, 'migrations', lastMigration));

    await pool.query('BEGIN');
    try {
        await migration.down();
        await pool.query('DELETE FROM migrations WHERE name = $1', [lastMigration]);
        await pool.query('COMMIT');
        console.log(`Migration rückgängig gemacht: ${lastMigration}`);
    } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
    }
};

async function runMigrations(direction = 'up') {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const migrationsDir = path.join(__dirname, 'migrations');
        const files = await fs.readdir(migrationsDir);
        const migrations = files
            .filter(f => f.endsWith('.js'))
            .sort();

        if (direction === 'down') {
            migrations.reverse();
        }

        for (const migrationFile of migrations) {
            console.log(`Fhre Migration aus: ${migrationFile}`);
            const migration = require(`./migrations/${migrationFile}`);
            await migration[direction]();
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Migrations-Fehler:', error);
        throw error;
    } finally {
        client.release();
    }
}

const combinedMigration = `
    -- Drop existing tables if they exist
    DROP TABLE IF EXISTS athlete_stats CASCADE;
    DROP TABLE IF EXISTS competition_results CASCADE;
    DROP TABLE IF EXISTS competitions CASCADE;
    DROP TABLE IF EXISTS tracks CASCADE;
    DROP TABLE IF EXISTS athletes CASCADE;
    DROP TABLE IF EXISTS facilities CASCADE;
    DROP TABLE IF EXISTS staff CASCADE;
    DROP TABLE IF EXISTS teams CASCADE;
    DROP TABLE IF EXISTS users CASCADE;

    -- Create tables
    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE teams (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        country CHAR(3) NOT NULL,
        city VARCHAR(100),
        budget INTEGER DEFAULT 2500000,
        reputation INTEGER DEFAULT 80,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE staff (
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

    CREATE TABLE facilities (
        id SERIAL PRIMARY KEY,
        team_id INTEGER REFERENCES teams(id),
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        capacity INTEGER,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE athletes (
        id SERIAL PRIMARY KEY,
        team_id INTEGER REFERENCES teams(id),
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        nationality CHAR(3) NOT NULL,
        fis_code VARCHAR(20),
        birth_date DATE,
        overall_rating INTEGER,
        potential_rating INTEGER,
        contract_salary INTEGER,
        contract_end DATE,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE athlete_stats (
        id SERIAL PRIMARY KEY,
        athlete_id INTEGER REFERENCES athletes(id),
        technik INTEGER DEFAULT 50,
        kraft INTEGER DEFAULT 50,
        ausdauer INTEGER DEFAULT 50,
        mental INTEGER DEFAULT 50,
        gleittechnik INTEGER DEFAULT 50,
        kantentechnik INTEGER DEFAULT 50,
        sprung_technik INTEGER DEFAULT 50,
        form INTEGER DEFAULT 50,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE tracks (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        country CHAR(3) NOT NULL,
        length INTEGER,
        altitude_diff INTEGER,
        start_altitude INTEGER,
        finish_altitude INTEGER,
        homologation_nr VARCHAR(20),
        discipline VARCHAR(20),
        gates_count INTEGER,
        weather_conditions VARCHAR(50),
        snow_conditions VARCHAR(50),
        temperature_start DECIMAL,
        temperature_finish DECIMAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE competitions (
        id SERIAL PRIMARY KEY,
        track_id INTEGER REFERENCES tracks(id),
        name VARCHAR(100) NOT NULL,
        discipline VARCHAR(20) NOT NULL,
        start_date TIMESTAMP NOT NULL,
        status VARCHAR(20) DEFAULT 'upcoming',
        prize_money INTEGER,
        fis_points INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE competition_results (
        id SERIAL PRIMARY KEY,
        competition_id INTEGER REFERENCES competitions(id),
        athlete_id INTEGER REFERENCES athletes(id),
        team_id INTEGER REFERENCES teams(id),
        bib INTEGER,
        run1_time DECIMAL(10,2),
        run2_time DECIMAL(10,2),
        total_time DECIMAL(10,2),
        diff DECIMAL(10,2),
        fis_points INTEGER,
        cup_points INTEGER,
        status VARCHAR(20) DEFAULT 'registered',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes
    CREATE INDEX idx_team_user ON teams(user_id);
    CREATE INDEX idx_athlete_team ON athletes(team_id);
    CREATE INDEX idx_athlete_stats ON athlete_stats(athlete_id);
    CREATE INDEX idx_competition_track ON competitions(track_id);
    CREATE INDEX idx_result_competition ON competition_results(competition_id);
    CREATE INDEX idx_result_athlete ON competition_results(athlete_id);
    CREATE INDEX idx_result_team ON competition_results(team_id);
    CREATE INDEX idx_staff_team ON staff(team_id);
    CREATE INDEX idx_facility_team ON facilities(team_id);
`;

async function migrate() {
    try {
        console.log('Starte Migration...');
        await pool.query(combinedMigration);
        console.log('Migration erfolgreich!');
        
        // Direkt seeden
        await seedDatabase();
    } catch (error) {
        console.error('Fehler bei der Migration:', error);
        throw error;
    }
}

async function seedDatabase() {
    try {
        console.log('Starte Seeding...');
        
        // Create test user
        const hashedPassword = 'test123'; // In Produktion: await bcrypt.hash('test123', 10)
        const userResult = await pool.query(`
            INSERT INTO users (username, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id
        `, ['admin', 'admin@test.com', hashedPassword]);
        
        const userId = userResult.rows[0].id;
        
        // Seed teams
        const teams = [
            ['ÖSV Elite Team', 'AUT', userId],
            ['Swiss-Ski Racing', 'SUI', null],
            ['DSV Leistungsteam', 'GER', null],
            ['FISI Team Elite', 'ITA', null],
            ['FFS Competition', 'FRA', null]
        ];
        
        for (const [name, country, user_id] of teams) {
            await pool.query(`
                INSERT INTO teams (name, country, budget, reputation, user_id)
                VALUES ($1, $2, $3, $4, $5)
            `, [name, country, 1000000, 50, user_id]);
        }
        
        console.log('Seeding erfolgreich!');
    } catch (error) {
        console.error('Fehler beim Seeding:', error);
        throw error;
    }
}

// Führe Migration aus
migrate().then(() => {
    console.log('Migration und Seeding abgeschlossen');
    process.exit(0);
}).catch(error => {
    console.error('Fehler:', error);
    process.exit(1);
}); 