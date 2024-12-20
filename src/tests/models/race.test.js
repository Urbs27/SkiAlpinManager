const Race = require('../../models/race');
const db = require('../../database/testDb');

describe('Race Model', () => {
    beforeEach(async () => {
        await db.query('DELETE FROM races');
    });

    test('sollte neues Rennen erstellen', async () => {
        const raceData = {
            name: 'Testrennen',
            date: new Date(),
            type: 'slalom',
            location: 'Testort'
        };

        const race = await Race.create(raceData);

        expect(race.id).toBeDefined();
        expect(race.name).toBe(raceData.name);
    });

    test('sollte Rennergebnisse speichern', async () => {
        const race = await Race.create({
            name: 'Testrennen',
            date: new Date(),
            type: 'slalom'
        });

        const result = await race.addResult({
            playerId: 1,
            time: 120.5,
            points: 100
        });

        expect(result.id).toBeDefined();
        expect(result.time).toBe(120.5);
    });

    // Weitere Renn-Tests...
}); 