const Team = require('../../models/team');
const { dbAsync } = require('../../config/database');

// Mocks
jest.mock('../../config/database', () => ({
    dbAsync: {
        get: jest.fn(),
        run: jest.fn().mockResolvedValue({ lastID: 1 }),
        all: jest.fn()
    }
}));

describe('Team Model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getById', () => {
        it('sollte ein Team anhand der ID zurückgeben', async () => {
            const mockTeam = {
                id: 1,
                name: 'Test Team',
                nation: 'Deutschland',
                city: 'Berlin',
                budget: 1000000,
                reputation: 50
            };
            dbAsync.get.mockResolvedValue(mockTeam);

            const team = await Team.getById(1);
            
            expect(team).toEqual(mockTeam);
            expect(dbAsync.get).toHaveBeenCalledWith(
                expect.any(String),
                [1]
            );
        });

        it('sollte null zurückgeben wenn kein Team gefunden wurde', async () => {
            dbAsync.get.mockResolvedValue(null);
            
            const team = await Team.getById(999);
            
            expect(team).toBeNull();
        });
    });

    describe('create', () => {
        it('sollte ein neues Team erstellen', async () => {
            const teamData = {
                name: 'Neues Team',
                nation: 'Österreich',
                city: 'Wien',
                budget: 500000,
                reputation: 60,
                user_id: 2
            };

            const teamId = await Team.create(teamData);

            expect(teamId).toBe(1);
            expect(dbAsync.run).toHaveBeenCalledWith(
                expect.any(String),
                [
                    teamData.name,
                    teamData.nation,
                    teamData.city,
                    teamData.budget,
                    teamData.reputation,
                    teamData.user_id
                ]
            );
        });

        it('sollte Standardwerte für budget und reputation verwenden', async () => {
            const minimalTeamData = {
                name: 'Minimal Team',
                nation: 'Italien',
                city: 'Rom',
                user_id: 3
            };

            await Team.create(minimalTeamData);

            expect(dbAsync.run).toHaveBeenCalledWith(
                expect.any(String),
                [
                    minimalTeamData.name,
                    minimalTeamData.nation,
                    minimalTeamData.city,
                    1000000,  // Standard budget
                    50,       // Standard reputation
                    minimalTeamData.user_id
                ]
            );
        });
    });

    describe('updateBudget', () => {
        it('sollte das Budget eines Teams aktualisieren', async () => {
            await Team.updateBudget(1, 200000);

            expect(dbAsync.run).toHaveBeenCalledWith(
                expect.any(String),
                [200000, 1]
            );
        });
    });

    describe('updateReputation', () => {
        it('sollte die Reputation eines Teams aktualisieren', async () => {
            await Team.updateReputation(1, 20);

            expect(dbAsync.run).toHaveBeenCalledWith(
                expect.any(String),
                [20, 20, 20, 1]
            );
        });

        it('sollte die Reputation auf 100 begrenzen', async () => {
            await Team.updateReputation(1, 150);

            expect(dbAsync.run).toHaveBeenCalledWith(
                expect.any(String),
                [150, 150, 150, 1]
            );
        });
    });

    describe('getCount', () => {
        it('sollte die Anzahl der Teams zurückgeben', async () => {
            dbAsync.get.mockResolvedValue({ count: 5 });

            const count = await Team.getCount();

            expect(count).toBe(5);
            expect(dbAsync.get).toHaveBeenCalledWith(
                'SELECT COUNT(*) as count FROM teams'
            );
        });
    });

    describe('getTotalPlayersCount', () => {
        it('sollte die Gesamtanzahl der Spieler zurückgeben', async () => {
            dbAsync.get.mockResolvedValue({ count: 25 });

            const count = await Team.getTotalPlayersCount();

            expect(count).toBe(25);
            expect(dbAsync.get).toHaveBeenCalledWith(
                'SELECT COUNT(*) as count FROM players'
            );
        });
    });

    describe('getByUserId', () => {
        it('sollte ein Team anhand der User-ID zurückgeben', async () => {
            const mockTeam = {
                id: 1,
                name: 'User Team',
                nation: 'Schweiz',
                city: 'Zürich'
            };
            dbAsync.get.mockResolvedValue(mockTeam);

            const team = await Team.getByUserId(1);
            
            expect(team).toEqual(mockTeam);
            expect(dbAsync.get).toHaveBeenCalledWith(
                expect.stringContaining('SELECT * FROM teams WHERE user_id = ?'),
                [1]
            );
        });
    });

    describe('update', () => {
        it('sollte ein Team aktualisieren', async () => {
            const updateData = {
                name: 'Updated Team',
                city: 'München',
                reputation: 75
            };

            await Team.update(1, updateData);

            expect(dbAsync.run).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE teams'),
                expect.arrayContaining([
                    updateData.name,
                    updateData.city,
                    updateData.reputation,
                    1
                ])
            );
        });

        it('sollte leere Updates verarbeiten', async () => {
            const emptyUpdate = {};
            await Team.update(1, emptyUpdate);

            const [query, params] = dbAsync.run.mock.calls[0];
            
            expect(query).toContain('UPDATE teams');
            expect(query).toContain('SET');
            expect(params).toHaveLength(6);
            expect(params[params.length - 1]).toBe(1);
        });

        it('sollte keine Änderung vornehmen wenn keine Daten übergeben werden', async () => {
            const emptyData = {};
            
            await Team.update(1, emptyData);

            expect(dbAsync.run).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE teams'),
                [
                    undefined,  // name
                    undefined,  // nation
                    undefined,  // city
                    undefined,  // budget
                    undefined,  // reputation
                    1          // id
                ]
            );
        });

        it('sollte mit null-Werten umgehen können', async () => {
            const nullData = {
                name: null,
                nation: null,
                city: null,
                budget: null,
                reputation: null
            };
            
            await Team.update(1, nullData);

            expect(dbAsync.run).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE teams'),
                [null, null, null, null, null, 1]
            );
        });
    });

    describe('Grenzwerte und Validierung', () => {
        it('sollte negative Budget-Änderungen erlauben', async () => {
            dbAsync.run.mockResolvedValue({ changes: 1 });
            
            await Team.updateBudget(1, -50000);

            expect(dbAsync.run).toHaveBeenCalledWith(
                expect.any(String),
                [-50000, 1]
            );
        });

        it('sollte Reputation auf 0 begrenzen', async () => {
            dbAsync.run.mockResolvedValue({ changes: 1 });
            
            await Team.updateReputation(1, -200);

            expect(dbAsync.run).toHaveBeenCalledWith(
                expect.stringContaining('CASE'),
                [-200, -200, -200, 1]
            );
        });
    });

    describe('Fehlerbehandlung', () => {
        it('sollte Fehler bei getById behandeln', async () => {
            dbAsync.get.mockRejectedValue(new Error('DB Error'));

            await expect(Team.getById(1)).rejects.toThrow('DB Error');
        });

        it('sollte Fehler bei create behandeln', async () => {
            dbAsync.run.mockRejectedValue(new Error('Insert Error'));

            await expect(Team.create({
                name: 'Error Team',
                nation: 'Deutschland',
                city: 'Berlin',
                budget: 1000000,
                reputation: 50,
                user_id: 1
            })).rejects.toThrow('Insert Error');
        });

        it('sollte Fehler bei update behandeln', async () => {
            dbAsync.run.mockRejectedValue(new Error('Update Error'));

            await expect(Team.update(1, {
                name: 'Error Update'
            })).rejects.toThrow('Update Error');
        });

        it('sollte Fehler bei updateBudget behandeln', async () => {
            dbAsync.run.mockRejectedValue(new Error('Budget Error'));

            await expect(Team.updateBudget(1, 100000))
                .rejects.toThrow('Budget Error');
        });

        it('sollte Fehler bei updateReputation behandeln', async () => {
            dbAsync.run.mockRejectedValue(new Error('Reputation Error'));

            await expect(Team.updateReputation(1, 10))
                .rejects.toThrow('Reputation Error');
        });
    });

    describe('getFullDetails', () => {
        it('sollte vollständige Team-Details zurückgeben', async () => {
            // Mock für das Team
            const mockTeam = {
                id: 1,
                name: 'Test Team',
                nation: 'Deutschland',
                city: 'Berlin'
            };
            
            // Mock für Staff, Facilities und Players
            const mockStaff = [
                { id: 1, name: 'Trainer 1', role: 'Head Coach' },
                { id: 2, name: 'Trainer 2', role: 'Assistant Coach' }
            ];
            
            const mockFacilities = [
                { id: 1, name: 'Trainingszentrum', level: 2 },
                { id: 2, name: 'Physiotherapie', level: 1 }
            ];
            
            const mockPlayers = [
                { 
                    id: 1, 
                    name: 'Spieler 1',
                    technik: 80,
                    kraft: 75,
                    ausdauer: 85,
                    mental: 70,
                    gleittechnik: 82,
                    kantentechnik: 78,
                    sprung_technik: 76,
                    form: 85
                }
            ];

            // Mocks für die verschiedenen Datenbankaufrufe
            dbAsync.get.mockResolvedValueOnce(mockTeam);  // Für getById
            dbAsync.all
                .mockResolvedValueOnce(mockStaff)      // Für team_staff
                .mockResolvedValueOnce(mockFacilities) // Für team_facilities
                .mockResolvedValueOnce(mockPlayers);   // Für players

            const teamDetails = await Team.getFullDetails(1);

            expect(teamDetails).toEqual({
                ...mockTeam,
                staff: mockStaff,
                facilities: mockFacilities,
                players: mockPlayers
            });

            // Überprüfen der SQL-Aufrufe
            expect(dbAsync.get).toHaveBeenCalledWith(
                expect.any(String),
                [1]
            );
            expect(dbAsync.all).toHaveBeenCalledTimes(3);
            expect(dbAsync.all).toHaveBeenCalledWith(
                expect.stringContaining('SELECT * FROM team_staff'),
                [1]
            );
            expect(dbAsync.all).toHaveBeenCalledWith(
                expect.stringContaining('SELECT * FROM team_facilities'),
                [1]
            );
            expect(dbAsync.all).toHaveBeenCalledWith(
                expect.stringContaining('SELECT p.*, ps.technik'),
                [1]
            );
        });

        it('sollte null zurückgeben wenn das Team nicht existiert', async () => {
            dbAsync.get.mockResolvedValueOnce(null);  // Team existiert nicht

            const teamDetails = await Team.getFullDetails(999);

            expect(teamDetails).toBeNull();
            expect(dbAsync.all).not.toHaveBeenCalled();
        });

        it('sollte mit leeren Arrays umgehen können', async () => {
            const mockTeam = {
                id: 1,
                name: 'Test Team',
                nation: 'Deutschland',
                city: 'Berlin'
            };

            dbAsync.get.mockResolvedValueOnce(mockTeam);
            dbAsync.all
                .mockResolvedValueOnce([])  // Keine Staff-Mitglieder
                .mockResolvedValueOnce([])  // Keine Facilities
                .mockResolvedValueOnce([]); // Keine Spieler

            const teamDetails = await Team.getFullDetails(1);

            expect(teamDetails).toEqual({
                ...mockTeam,
                staff: [],
                facilities: [],
                players: []
            });
        });

        it('sollte Fehler bei der Detailabfrage behandeln', async () => {
            dbAsync.get.mockResolvedValueOnce({
                id: 1,
                name: 'Test Team'
            });
            dbAsync.all.mockRejectedValueOnce(new Error('DB Error'));

            await expect(Team.getFullDetails(1)).rejects.toThrow('DB Error');
        });
    });

    describe('getCount und getTotalPlayersCount Edge Cases', () => {
        it('sollte 0 zurückgeben wenn keine Teams existieren', async () => {
            dbAsync.get.mockResolvedValueOnce(null);
            
            const count = await Team.getCount();
            
            expect(count).toBe(0);
        });

        it('sollte 0 zurückgeben wenn keine Spieler existieren', async () => {
            dbAsync.get.mockResolvedValueOnce(null);
            
            const count = await Team.getTotalPlayersCount();
            
            expect(count).toBe(0);
        });

        it('sollte mit ungültigen Datenbankrückgaben umgehen können', async () => {
            dbAsync.get.mockResolvedValueOnce(undefined);
            
            const count = await Team.getCount();
            
            expect(count).toBe(0);
        });
    });
}); 