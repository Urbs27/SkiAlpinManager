const testDb = require('./testDb');

async function setupTestDatabase() {
    try {
        console.log('Setting up test database...');
        await testDb.connect();
        await testDb.init();
        console.log('Test database setup complete');
    } catch (error) {
        console.error('Error setting up test database:', error);
        process.exit(1);
    }
}

setupTestDatabase(); 