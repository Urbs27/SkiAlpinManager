const { pool } = require('../config/database');

async function checkDatabase() {
    try {
        console.log('Datenbank Status:');
        console.log('----------------');

        // Teams
        const teamsCount = await pool.query('SELECT COUNT(*) FROM teams');
        console.log(`Teams: ${teamsCount.rows[0].count}`);

        // Athleten
        const athletesCount = await pool.query('SELECT COUNT(*) FROM athletes');
        console.log(`Athleten: ${athletesCount.rows[0].count}`);

        // Staff
        const staffCount = await pool.query('SELECT COUNT(*) FROM staff');
        console.log(`Staff: ${staffCount.rows[0].count}`);

        // Athleten Stats Details
        const statsQuery = await pool.query(`
            SELECT 
                COUNT(DISTINCT athlete_id) as athletes_with_stats,
                COUNT(*) as total_stats
            FROM athlete_stats
        `);
        console.log(`Athleten mit Stats: ${statsQuery.rows[0].athletes_with_stats}`);
        console.log(`Gesamt Stats Einträge: ${statsQuery.rows[0].total_stats}`);

        // Einrichtungen
        const facilitiesCount = await pool.query('SELECT COUNT(*) FROM facilities');
        console.log(`Einrichtungen: ${facilitiesCount.rows[0].count}`);

        // Prüfungen
        if (teamsCount.rows[0].count !== 5) {
            console.log('⚠️  Warnung: Unerwartete Anzahl an Teams');
        }

        if (statsQuery.rows[0].athletes_with_stats < athletesCount.rows[0].count) {
            console.log('⚠️  Warnung: Nicht alle Athleten haben Stats');
            console.log(`    ${statsQuery.rows[0].athletes_with_stats} von ${athletesCount.rows[0].count} Athleten haben Stats`);
        }

        if (statsQuery.rows[0].total_stats > athletesCount.rows[0].count) {
            console.log('⚠️  Warnung: Mehr Stats als Athleten');
            console.log(`    ${statsQuery.rows[0].total_stats} Stats für ${athletesCount.rows[0].count} Athleten`);
        }

    } catch (error) {
        console.error('Fehler beim Datenbankcheck:', error);
    }
}

checkDatabase(); 