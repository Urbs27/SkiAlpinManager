const Player = require('../../models/player');
const { dbAsync } = require('../../config/database');

// Mocks
jest.mock('../../config/database', () => ({
    dbAsync: {
        get: jest.fn(),
        run: jest.fn().mockResolvedValue({ lastID: 1, changes: 1 }),
        all: jest.fn()
    }
}));

describe('Player Model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('sollte einen neuen Spieler mit Stats erstellen', async () => {
            const playerData = {
                team_id: 1,
                first_name: 'Max',
                last_name: 'Mustermann',
                nationality: 'AUT',
                birth_date: '2000-01-01',
                overall_rating: 75,
                potential_rating: 85
            };

            const playerId = await Player.create(playerData);

            expect(playerId).toBe(1);
            expect(dbAsync.run).toHaveBeenCalledTimes(2); // Player + Stats
            expect(dbAsync.run).toHaveBeenNthCalledWith(1,
                expect.stringContaining('INSERT INTO players'),
                expect.arrayContaining([
                    playerData.team_id,
                    playerData.first_name,
                    playerData.last_name
                ])
            );
        });

        it('sollte Fehler bei fehlenden Pflichtfeldern werfen', async () => {
            const invalidData = {
                first_name: 'Max'
                // last_name und team_id fehlen
            };

            await expect(Player.create(invalidData))
                .rejects
                .toThrow('Pflichtfelder fehlen');
        });

        it('sollte Fehler bei ungültigem Geburtsdatum werfen', async () => {
            const futureData = {
                first_name: 'Max',
                last_name: 'Future',
                team_id: 1,
                birth_date: '2025-01-01'
            };

            await expect(Player.create(futureData))
                .rejects
                .toThrow('Geburtsdatum kann nicht in der Zukunft liegen');
        });

        it('sollte Fehler bei ungültigem Ländercode werfen', async () => {
            const invalidData = {
                first_name: 'Max',
                last_name: 'Invalid',
                team_id: 1,
                nationality: 'INVALID'
            };

            await expect(Player.create(invalidData))
                .rejects
                .toThrow('Ungültiger Ländercode');
        });

        it('sollte Default-Werte für Ratings verwenden', async () => {
            const playerData = {
                team_id: 1,
                first_name: 'Max',
                last_name: 'Mustermann',
                nationality: 'AUT'
                // overall_rating und potential_rating fehlen
            };

            const playerId = await Player.create(playerData);

            expect(playerId).toBe(1);
            expect(dbAsync.run).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO players'),
                expect.arrayContaining([
                    50,  // Default overall_rating
                    50   // Default potential_rating
                ])
            );
        });

        it('sollte optionale Felder korrekt verarbeiten', async () => {
            const playerData = {
                team_id: 1,
                first_name: 'Max',
                last_name: 'Mustermann',
                // nationality ist optional
                birth_date: null,
                fis_code: null
            };

            await Player.create(playerData);

            expect(dbAsync.run).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO players'),
                expect.arrayContaining([
                    null,  // nationality
                    null,  // fis_code
                    null   // birth_date
                ])
            );
        });

        it('sollte Geburtsdatum nur validieren wenn es gesetzt ist', async () => {
            const playerData = {
                team_id: 1,
                first_name: 'Max',
                last_name: 'Mustermann',
                // birth_date nicht gesetzt
            };

            await expect(Player.create(playerData)).resolves.toBe(1);
        });

        it('sollte Nationalität nur validieren wenn sie gesetzt ist', async () => {
            const playerData = {
                team_id: 1,
                first_name: 'Max',
                last_name: 'Mustermann',
                // nationality nicht gesetzt
            };

            await expect(Player.create(playerData)).resolves.toBe(1);
        });
    });

    describe('getById', () => {
        it('sollte einen Spieler mit allen Details zurückgeben', async () => {
            const mockPlayer = {
                id: 1,
                first_name: 'Max',
                last_name: 'Mustermann',
                team_name: 'Test Team'
            };

            const mockFISPoints = { dh: 50, sg: 45 };
            const mockHistory = { seasons: [] };
            const mockInjuries = { current: null };

            dbAsync.get
                .mockResolvedValueOnce(mockPlayer)  // Hauptabfrage
                .mockResolvedValueOnce(mockFISPoints)  // FIS Points
                .mockResolvedValueOnce(mockHistory)  // History
                .mockResolvedValueOnce(mockInjuries);  // Injuries

            const player = await Player.getById(1);

            expect(player).toEqual({
                ...mockPlayer,
                fis_points: mockFISPoints,
                history: mockHistory,
                injuries: mockInjuries
            });
        });

        it('sollte null zurückgeben wenn kein Spieler gefunden wurde', async () => {
            dbAsync.get.mockResolvedValueOnce(null);

            const player = await Player.getById(999);

            expect(player).toBeNull();
        });
    });

    describe('update', () => {
        it('sollte Basis-Daten aktualisieren', async () => {
            const updateData = {
                first_name: 'MaxNeu',
                last_name: 'MustermannNeu',
                contract_salary: 100000
            };

            await Player.update(1, updateData);

            expect(dbAsync.run).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE players'),
                expect.arrayContaining([
                    updateData.first_name,
                    updateData.last_name,
                    updateData.contract_salary
                ])
            );
        });

        it('sollte Statistiken aktualisieren', async () => {
            const updateData = {
                stats: {
                    technik: 80,
                    kraft: 75,
                    form: 85
                }
            };

            await Player.update(1, updateData);

            expect(dbAsync.run).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE player_stats'),
                expect.arrayContaining([
                    updateData.stats.technik,
                    updateData.stats.kraft,
                    updateData.stats.form
                ])
            );
        });

        it('sollte leere Updates ignorieren', async () => {
            await Player.update(1, {});
            expect(dbAsync.run).not.toHaveBeenCalled();
        });
    });

    describe('delete', () => {
        it('sollte einen Spieler erfolgreich löschen', async () => {
            const result = await Player.delete(1);

            expect(result).toBe(true);
            expect(dbAsync.run).toHaveBeenCalledWith(
                expect.stringContaining('DELETE FROM players'),
                [1]
            );
        });

        it('sollte false zurückgeben wenn kein Spieler gelöscht wurde', async () => {
            dbAsync.run.mockResolvedValueOnce({ changes: 0 });

            const result = await Player.delete(999);

            expect(result).toBe(false);
        });
    });

    describe('Zusätzliche Methoden', () => {
        it('sollte FIS-Punkte abrufen', async () => {
            await Player.getFISPoints(1);
            expect(dbAsync.get).toHaveBeenCalledWith(
                expect.stringContaining('SELECT * FROM player_fis_points'),
                [1]
            );
        });

        it('sollte Spieler-Historie abrufen', async () => {
            await Player.getPlayerHistory(1);
            expect(dbAsync.get).toHaveBeenCalledWith(
                expect.stringContaining('SELECT * FROM player_history'),
                [1]
            );
        });

        it('sollte aktive Verletzungen abrufen', async () => {
            await Player.getPlayerInjuries(1);
            expect(dbAsync.get).toHaveBeenCalledWith(
                expect.stringContaining('SELECT * FROM player_injuries'),
                [1]
            );
        });
    });

    describe('getByTeamId', () => {
        it('sollte alle Spieler eines Teams zurückgeben', async () => {
            const mockPlayers = [
                {
                    id: 1,
                    first_name: 'Max',
                    last_name: 'Mustermann',
                    technik: 75,
                    kraft: 80
                },
                {
                    id: 2,
                    first_name: 'John',
                    last_name: 'Doe',
                    technik: 70,
                    kraft: 85
                }
            ];

            dbAsync.all.mockResolvedValueOnce(mockPlayers);

            const players = await Player.getByTeamId(1);

            expect(players).toEqual(mockPlayers);
            expect(dbAsync.all).toHaveBeenCalledWith(
                expect.stringContaining('SELECT p.*'),
                [1]
            );
            expect(dbAsync.all.mock.calls[0][0]).toContain('LEFT JOIN player_stats');
            expect(dbAsync.all.mock.calls[0][0]).toContain('ORDER BY p.last_name ASC');
        });

        it('sollte ein leeres Array zurückgeben wenn keine Spieler gefunden wurden', async () => {
            dbAsync.all.mockResolvedValueOnce([]);

            const players = await Player.getByTeamId(999);

            expect(players).toEqual([]);
        });
    });

    describe('Error Handling', () => {
        it('sollte Datenbankfehler bei getById behandeln', async () => {
            dbAsync.get.mockRejectedValueOnce(new Error('DB Error'));

            await expect(Player.getById(1))
                .rejects
                .toThrow('DB Error');
        });

        it('sollte Datenbankfehler bei getByTeamId behandeln', async () => {
            dbAsync.all.mockRejectedValueOnce(new Error('DB Error'));

            await expect(Player.getByTeamId(1))
                .rejects
                .toThrow('DB Error');
        });
    });
}); 