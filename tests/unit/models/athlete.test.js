const Athlete = require('../../../src/models/athlete');
const db = require('../../../src/config/database');

describe('Athlete Model Test', () => {
    beforeAll(async () => {
        // Verbindung zur Testdatenbank herstellen
        await db.connect();
    });

    afterAll(async () => {
        // Verbindung schließen
        await db.close();
    });

    test('should create a new athlete', async () => {
        const athleteData = {
            first_name: 'Max',
            last_name: 'Mustermann',
            nationality: 'GER',
            birth_date: '1995-01-01',
            height: 180,
            weight: 75
        };

        const athlete = await Athlete.create(athleteData);
        expect(athlete.first_name).toBe('Max');
        expect(athlete.last_name).toBe('Mustermann');
    });
}); 