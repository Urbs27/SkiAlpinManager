const { testConnection } = require('../config/database');

async function test() {
    try {
        const result = await testConnection();
        if (result) {
            console.log('Verbindung erfolgreich!');
        } else {
            console.log('Verbindung fehlgeschlagen!');
        }
    } catch (error) {
        console.error('Test fehlgeschlagen:', error);
    }
    process.exit();
}

test(); 