const { dbAsync } = require('./database');

async function updateDatabase() {
    // Zuerst prüfen, ob die Tabelle existiert
    try {
        await dbAsync.run(`
            CREATE TABLE IF NOT EXISTS competition_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                competition_id INTEGER NOT NULL,
                player_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (competition_id) REFERENCES competitions(id),
                FOREIGN KEY (player_id) REFERENCES players(id)
            )
        `);
        console.log('Tabelle competition_results erstellt oder existiert bereits');

        // Dann die Spalten hinzufügen
        const alterTableQueries = [
            'ALTER TABLE competition_results ADD COLUMN rank INTEGER;',
            'ALTER TABLE competition_results ADD COLUMN time REAL;',
            'ALTER TABLE competition_results ADD COLUMN points INTEGER;'
        ];

        for (const query of alterTableQueries) {
            try {
                await dbAsync.run(query);
                console.log('Update erfolgreich ausgeführt:', query);
            } catch (err) {
                // Ignoriere den Fehler, wenn die Spalte bereits existiert
                if (!err.message.includes('duplicate column name')) {
                    console.error('Fehler beim Update:', err);
                } else {
                    console.log('Spalte existiert bereits:', query);
                }
            }
        }
    } catch (err) {
        console.error('Fehler beim Erstellen der Tabelle:', err);
    }
}

// Führe das Update aus
updateDatabase()
    .then(() => console.log('Datenbank-Update abgeschlossen'))
    .catch(err => console.error('Fehler beim Datenbank-Update:', err)); 