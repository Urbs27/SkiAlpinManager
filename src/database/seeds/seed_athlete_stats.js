const { pool } = require('../../config/database');

async function seedAthleteStats() {
    try {
        console.log('Starte Athleten-Stats-Seeding...');

        // Erst alle existierenden Stats löschen
        await pool.query('DELETE FROM athlete_stats');
        console.log('Existierende Stats gelöscht');

        // Alle aktiven Athleten abrufen
        const athletesResult = await pool.query('SELECT id FROM athletes WHERE status = $1', ['active']);
        const athletes = athletesResult.rows;

        for (const athlete of athletes) {
            // Nur ein Stats-Eintrag pro Athlet
            await pool.query(`
                INSERT INTO athlete_stats (
                    athlete_id,
                    technik,
                    kraft,
                    ausdauer,
                    mental,
                    gleittechnik,
                    kantentechnik,
                    sprung_technik,
                    form
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
                athlete.id,
                50 + Math.floor(Math.random() * 50),
                50 + Math.floor(Math.random() * 50),
                50 + Math.floor(Math.random() * 50),
                50 + Math.floor(Math.random() * 50),
                50 + Math.floor(Math.random() * 50),
                50 + Math.floor(Math.random() * 50),
                50 + Math.floor(Math.random() * 50),
                50 + Math.floor(Math.random() * 50)
            ]);
            console.log(`Stats für Athlet ${athlete.id} erstellt`);
        }

        console.log(`Stats für ${athletes.length} Athleten erstellt!`);
    } catch (error) {
        console.error('Fehler beim Seeding der Athleten-Stats:', error);
        throw error;
    }
}

seedAthleteStats().catch(console.error); 