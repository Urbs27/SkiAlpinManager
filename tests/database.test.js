const db = require('../src/config/database');

describe('Database Connection', () => {
    test('should connect to database', async () => {
        try {
            await db.connect();
            expect(db.isConnected()).toBe(true);
        } catch (error) {
            fail('Database connection failed: ' + error.message);
        }
    });
}); 