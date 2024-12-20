const Player = require('../models/player');
const { dbAsync } = require('../config/database');

jest.mock('../config/database', () => ({
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

    describe('getById', () => {
        test('should fetch complete player data', async () => {
            const mockPlayer = {
                id: 1,
                first_name: 'Marco',
                last_name: 'Odermatt',
                nationality: 'SUI',
                team_id: 1,
                team_name: 'Swiss Ski Team',
                technik: 95,
                kraft: 90
            };
            
            dbAsync.get
                .mockResolvedValueOnce(mockPlayer)
                .mockResolvedValueOnce({ points: 1000 })
                .mockResolvedValueOnce({ season: '2022/23' })
                .mockResolvedValueOnce(null);

            const player = await Player.getById(1);
            expect(player).toEqual({
                ...mockPlayer,
                fis_points: { points: 1000 },
                history: { season: '2022/23' },
                injuries: null
            });
        });

        test('should handle non-existent player', async () => {
            dbAsync.get.mockResolvedValue(null);
            const player = await Player.getById(999);
            expect(player).toBeNull();
        });
    });

    describe('create', () => {
        test('should validate required fields', async () => {
            const invalidData = {
                first_name: 'Marco'
                // last_name and team_id missing
            };

            await expect(Player.create(invalidData))
                .rejects.toThrow('Pflichtfelder fehlen');
        });

        test('should validate nationality format', async () => {
            const invalidData = {
                first_name: 'Marco',
                last_name: 'Odermatt',
                team_id: 1,
                nationality: 'INVALID'
            };

            await expect(Player.create(invalidData))
                .rejects.toThrow('Ungültiger Ländercode');
        });

        test('should create player with default stats', async () => {
            const validData = {
                first_name: 'Marco',
                last_name: 'Odermatt',
                team_id: 1,
                nationality: 'SUI'
            };

            const playerId = await Player.create(validData);
            expect(playerId).toBe(1);
            expect(dbAsync.run).toHaveBeenCalledTimes(2);
        });
    });

    describe('update', () => {
        test('should handle empty update data', async () => {
            await Player.update(1, {});
            expect(dbAsync.run).not.toHaveBeenCalled();
        });

        test('should update partial player data', async () => {
            const updateData = {
                first_name: 'Updated',
                stats: {
                    form: 95,
                    fitness: 90
                }
            };

            await Player.update(1, updateData);
            expect(dbAsync.run).toHaveBeenCalledTimes(2);
        });
    });

    describe('delete', () => {
        test('should delete existing player', async () => {
            const result = await Player.delete(1);
            expect(result).toBe(true);
            expect(dbAsync.run).toHaveBeenCalledWith(
                'DELETE FROM players WHERE id = ?',
                [1]
            );
        });

        test('should handle non-existent player deletion', async () => {
            dbAsync.run.mockResolvedValueOnce({ changes: 0 });
            const result = await Player.delete(999);
            expect(result).toBe(false);
        });
    });

    describe('getByTeamId', () => {
        test('should fetch and sort team players', async () => {
            const mockPlayers = [
                { id: 1, last_name: 'Zurbriggen' },
                { id: 2, last_name: 'Odermatt' }
            ];
            dbAsync.all.mockResolvedValue(mockPlayers);

            const players = await Player.getByTeamId(1);
            expect(players).toEqual(mockPlayers);
            expect(dbAsync.all).toHaveBeenCalledWith(
                expect.stringContaining('ORDER BY p.last_name'),
                [1]
            );
        });
    });
}); 