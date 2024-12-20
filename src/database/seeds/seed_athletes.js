const { pool } = require('../../config/database');

const athleteTemplates = {
    AUT: {
        firstNames: ['Marcel', 'Vincent', 'Manuel', 'Marco', 'Stefan'],
        lastNames: ['Hirscher', 'Kriechmayr', 'Feller', 'Schwarz']
    },
    SUI: {
        firstNames: ['Marco', 'Beat', 'Loic', 'Daniel'],
        lastNames: ['Odermatt', 'Feuz', 'Meillard', 'Yule']
    },
    GER: {
        firstNames: ['Thomas', 'Josef', 'Linus', 'Alexander'],
        lastNames: ['Dreßen', 'Ferstl', 'Straßer', 'Schmid']
    }
};

async function seedAthletes() {
    try {
        console.log('Starte Athleten-Seeding...');

        // Teams abrufen
        const teamsResult = await pool.query('SELECT id, country FROM teams');
        const teams = teamsResult.rows;

        for (const team of teams) {
            const templates = athleteTemplates[team.country] || athleteTemplates.AUT;
            
            // 5-8 Athleten pro Team
            const numAthletes = Math.floor(Math.random() * 4) + 5;
            
            for (let i = 0; i < numAthletes; i++) {
                const firstName = templates.firstNames[Math.floor(Math.random() * templates.firstNames.length)];
                const lastName = templates.lastNames[Math.floor(Math.random() * templates.lastNames.length)];
                
                await pool.query(`
                    INSERT INTO athletes (
                        team_id,
                        first_name,
                        last_name,
                        nationality,
                        birth_date,
                        overall_rating,
                        potential_rating,
                        contract_salary,
                        contract_end,
                        status
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                `, [
                    team.id,
                    firstName,
                    lastName,
                    team.country,
                    new Date(1990 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                    50 + Math.floor(Math.random() * 50),
                    50 + Math.floor(Math.random() * 50),
                    100000 + Math.floor(Math.random() * 900000),
                    new Date(2024 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                    'active'
                ]);
                
                console.log(`Athlet ${firstName} ${lastName} erstellt für Team ${team.country}`);
            }
        }

        console.log('Athleten-Seeding erfolgreich abgeschlossen!');
    } catch (error) {
        console.error('Fehler beim Seeding der Athleten:', error);
        throw error;
    }
}

seedAthletes().catch(console.error); 