const db = require('../../src/config/database');

describe('Database Connection', () => {
    beforeAll(async () => {
        const connected = await db.connect();
        expect(connected).toBe(true);
    });

    afterAll(async () => {
        await db.close();
    });

    test('should connect to the database', async () => {
        expect(db.isConnected()).toBe(true);
    });
}); 