const { pool } = require('../../config/database');
const bcrypt = require('bcrypt');

// Realistische Ski-Teams
const teams = [
    {
        name: 'ÖSV Elite Team',
        nation: 'AUT',
        city: 'Innsbruck',
        budget: 2500000,
        reputation: 90
    },
    {
        name: 'Swiss-Ski Racing',
        nation: 'SUI',
        city: 'Davos',
        budget: 2200000,
        reputation: 85
    },
    {
        name: 'DSV Leistungsteam',
        nation: 'GER',
        city: 'Garmisch',
        budget: 2000000,
        reputation: 80
    },
    {
        name: 'FISI Team Elite',
        nation: 'ITA',
        city: 'Cortina',
        budget: 1800000,
        reputation: 75
    },
    {
        name: 'FFS Competition',
        nation: 'FRA',
        city: 'Chamonix',
        budget: 1700000,
        reputation: 70
    }
];

// Realistische Mitarbeiter-Rollen
const staffRoles = [
    {
        role: 'head_coach',
        title: 'Cheftrainer',
        salary_range: [90000, 150000],
        quality_range: [75, 95]
    },
    {
        role: 'assistant_coach',
        title: 'Co-Trainer',
        salary_range: [60000, 90000],
        quality_range: [70, 85]
    },
    {
        role: 'technician',
        title: 'Ski-Techniker',
        salary_range: [55000, 85000],
        quality_range: [70, 90]
    },
    {
        role: 'physio',
        title: 'Physiotherapeut',
        salary_range: [50000, 75000],
        quality_range: [65, 85]
    },
    {
        role: 'mental_coach',
        title: 'Mentaltrainer',
        salary_range: [45000, 70000],
        quality_range: [60, 80]
    }
];

// Einrichtungen
const facilities = [
    {
        type: 'training_center',
        title: 'Trainingszentrum',
        cost_range: [500000, 2000000],
        level_range: [1, 5]
    },
    {
        type: 'medical_center',
        title: 'Medizinisches Zentrum',
        cost_range: [300000, 1000000],
        level_range: [1, 4]
    },
    {
        type: 'workshop',
        title: 'Ski-Werkstatt',
        cost_range: [200000, 800000],
        level_range: [1, 4]
    }
];

// Hilfsfunktionen
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
const randomDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + randomBetween(1, 3));
    return date.toISOString().split('T')[0];
};

/**
 * Erstellt einen Test-User
 */
async function createTestUser() {
    const hashedPassword = await bcrypt.hash('test123', 10);
    await pool.query(`
        INSERT INTO users (username, email, password_hash)
        VALUES ($1, $2, $3)
        ON CONFLICT (username) 
        DO UPDATE SET 
            email = EXCLUDED.email,
            password_hash = EXCLUDED.password_hash
    `, ['admin', 'admin@test.com', hashedPassword]);
}

/**
 * Hauptfunktion zum Seeden der Datenbank
 */
async function seedDatabase() {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        console.log('Starte Datenbank-Seeding...');
        
        // Erstelle Test-User und hole die ID
        await createTestUser();
        const userResult = await client.query(
            'SELECT id FROM users WHERE username = $1',
            ['admin']
        );
        const userId = userResult.rows[0].id;
        console.log('Test-User erstellt');
        
        // Teams erstellen
        for (const [index, team] of teams.entries()) {
            const teamResult = await client.query(
                `INSERT INTO teams (
                    name, country, city, budget, reputation, 
                    user_id, created_at, updated_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING id`,
                [
                    team.name,
                    team.nation,
                    team.city,
                    team.budget,
                    team.reputation,
                    index === 0 ? userId : null  // Nur das erste Team (ÖSV) bekommt die user_id
                ]
            );
            const teamId = teamResult.rows[0].id;
            
            // Staff für jedes Team erstellen
            for (const staffRole of staffRoles) {
                await client.query(
                    `INSERT INTO staff (team_id, first_name, last_name, role, hire_date, contract_end, status)
                     VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, 'active')`,
                    [
                        teamId,
                        `${staffRole.title}`,
                        team.nation,
                        staffRole.role,
                        randomDate()
                    ]
                );
            }
            
            // Einrichtungen für jedes Team erstellen
            for (const facility of facilities) {
                await client.query(
                    `INSERT INTO facilities (team_id, name, type, capacity, status)
                     VALUES ($1, $2, $3, $4, 'active')`,
                    [
                        teamId,
                        `${facility.title} ${team.name}`,
                        facility.type,
                        randomBetween(50, 200)
                    ]
                );
            }
            
            console.log(`Team "${team.name}" erstellt`);
        }
        
        await client.query('COMMIT');
        console.log('Datenbank-Seeding erfolgreich abgeschlossen!');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Fehler beim Seeding:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Führe Seeding aus
seedDatabase()
    .then(() => {
        console.log('Seeding abgeschlossen');
        process.exit(0);
    })
    .catch(error => {
        console.error('Seeding fehlgeschlagen:', error);
        process.exit(1);
    }); 