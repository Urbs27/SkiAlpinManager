const app = require('./app');
const { pool } = require('./config/database');
const { initializeDatabase } = require('./models/index');

const port = process.env.PORT || 3000;

async function startServer() {
    try {
        // Teste die Datenbankverbindung
        await pool.query('SELECT NOW()');
        console.log('Datenbankverbindung hergestellt');

        // Initialisiere die Datenbank-Tabellen
        await initializeDatabase();
        
        app.listen(port, () => {
            console.log(`Server läuft auf Port ${port}`);
        });
    } catch (error) {
        console.error('Fehler beim Starten des Servers:', error);
        process.exit(1);
    }
}

startServer(); 