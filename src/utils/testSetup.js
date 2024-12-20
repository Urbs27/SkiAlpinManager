const testDb = require('../database/testDb');

async function setupTestDatabase() {
    try {
        await testDb.connect();
        // Weitere Setup-Logik hier
    } catch (error) {
        console.error('Setup-Fehler:', error);
        throw error;
    }
}

async function teardownTestDatabase() {
    try {
        if (testDb.db) {
            await testDb.close();
        }
    } catch (error) {
        console.error('Teardown-Fehler:', error);
        throw error;
    }
}

async function clearTestData() {
    try {
        await testDb.clearTables();
    } catch (error) {
        console.error('Clear-Fehler:', error);
        throw error;
    }
}

module.exports = {
    testDb,
    setupTestDatabase,
    teardownTestDatabase,
    clearTestData
}; 