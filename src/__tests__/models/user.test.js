const User = require('../../models/user');
const TestDatabase = require('../../database/testDb');

describe('Ski Team Manager Tests', () => {
    let testDb;

    beforeAll(async () => {
        try {
            console.log('Initialisiere Ski-Alpin Test-DB...');
            testDb = new TestDatabase();
            await testDb.connect();
            await testDb.init();
            
            // Überschreibe die DB-Referenz
            const database = require('../../config/database');
            database.dbAsync = testDb;
            
            console.log('Test-DB erfolgreich initialisiert');
        } catch (error) {
            console.error('Setup-Fehler:', error);
            throw error;
        }
    });

    beforeEach(async () => {
        await testDb.clearTables();
    });

    afterAll(async () => {
        await testDb.close();
    });

    describe('Team Manager Erstellung', () => {
        test('sollte einen neuen Ski-Team-Manager erstellen', async () => {
            const managerData = {
                username: 'skicoach1',
                email: 'coach@skiteam.de',
                password: 'AlpinePro2024!',
                teamName: 'Alpine Stars Racing',
                nationality: 'GER'
            };

            const managerId = await User.create(managerData);
            expect(managerId).toBeDefined();

            const manager = await User.getById(managerId);
            expect(manager).toMatchObject({
                username: managerData.username,
                email: managerData.email,
                team_name: managerData.teamName,
                nationality: managerData.nationality,
                role: 'manager',
                status: 'active'
            });
        });

        test('sollte Fehler werfen bei doppeltem Teamnamen', async () => {
            const managerData = {
                username: 'skicoach1',
                email: 'coach@skiteam.de',
                password: 'AlpinePro2024!',
                teamName: 'Alpine Stars Racing',
                nationality: 'GER'
            };

            await User.create(managerData);

            const duplicateData = {
                ...managerData,
                username: 'skicoach2',
                email: 'coach2@skiteam.de'
            };

            await expect(User.create(duplicateData))
                .rejects
                .toThrow('Benutzername oder E-Mail bereits vergeben');
        });
    });

    describe('Team Statistiken', () => {
        test('sollte korrekte Anfangsstatistiken für neues Team zurückgeben', async () => {
            const managerData = {
                username: 'skicoach1',
                email: 'coach@skiteam.de',
                password: 'AlpinePro2024!',
                teamName: 'Alpine Stars Racing',
                nationality: 'GER'
            };

            const managerId = await User.create(managerData);
            const stats = await User.getStats(managerId);

            expect(stats).toMatchObject({
                budget: 1000000,
                reputation: 50,
                season_wins: 0,
                total_races: 0,
                athlete_count: 0,
                total_wins: 0
            });
        });
    });

    describe('Team Manager Authentifizierung', () => {
        test('sollte Manager authentifizieren', async () => {
            // Implementiere die Authentifizierungstests hier
        });
    });
}); 