const { Token, initializeTokenTable } = require('../../models/token');
const { dbAsync } = require('../../config/database');

// Mocks
jest.mock('../../config/database', () => ({
    dbAsync: {
        get: jest.fn(),
        run: jest.fn().mockResolvedValue({ lastID: 1 }),
        all: jest.fn()
    }
}));

describe('Token Model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('sollte einen neuen Token erstellen', async () => {
            const tokenData = {
                userId: 1,
                token: 'testToken123',
                type: 'reset',
                expiresAt: '2024-12-31 23:59:59'
            };

            const tokenId = await Token.create(tokenData);

            expect(tokenId).toBe(1);
            expect(dbAsync.run).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO tokens'),
                expect.arrayContaining([
                    tokenData.userId,
                    tokenData.token,
                    tokenData.type,
                    tokenData.expiresAt
                ])
            );
        });

        it('sollte Fehler bei der Token-Erstellung behandeln', async () => {
            const tokenData = {
                userId: 1,
                token: 'errorToken',
                type: 'reset',
                expiresAt: '2024-12-31'
            };

            dbAsync.run.mockRejectedValueOnce(new Error('DB Error'));

            await expect(Token.create(tokenData))
                .rejects
                .toThrow('DB Error');
        });
    });

    describe('findOne', () => {
        it('sollte einen gültigen Token finden', async () => {
            const mockToken = {
                id: 1,
                user_id: 1,
                token: 'validToken123',
                type: 'reset',
                expires_at: '2024-12-31 23:59:59'
            };

            dbAsync.get.mockResolvedValueOnce(mockToken);

            const result = await Token.findOne('validToken123', 'reset');

            expect(result).toEqual(mockToken);
            expect(dbAsync.get).toHaveBeenCalledWith(
                expect.stringContaining('SELECT * FROM tokens'),
                ['validToken123', 'reset']
            );
        });

        it('sollte null für einen nicht existierenden Token zurückgeben', async () => {
            dbAsync.get.mockResolvedValueOnce(null);

            const result = await Token.findOne('nonexistentToken', 'reset');

            expect(result).toBeNull();
        });
    });

    describe('delete', () => {
        it('sollte einen Token löschen', async () => {
            await Token.delete('testToken', 'reset');

            expect(dbAsync.run).toHaveBeenCalledWith(
                expect.stringContaining('DELETE FROM tokens'),
                ['testToken', 'reset']
            );
        });

        it('sollte Fehler beim Löschen behandeln', async () => {
            dbAsync.run.mockRejectedValueOnce(new Error('DB Error'));

            await expect(Token.delete('errorToken', 'reset'))
                .rejects
                .toThrow('DB Error');
        });
    });

    describe('deleteExpired', () => {
        it('sollte abgelaufene Tokens löschen', async () => {
            await Token.deleteExpired();

            expect(dbAsync.run).toHaveBeenCalledWith(
                expect.stringContaining('DELETE FROM tokens WHERE expires_at <= datetime')
            );
        });

        it('sollte Fehler beim Löschen abgelaufener Tokens behandeln', async () => {
            dbAsync.run.mockRejectedValueOnce(new Error('DB Error'));

            await expect(Token.deleteExpired())
                .rejects
                .toThrow('DB Error');
        });
    });

    describe('initializeTokenTable', () => {
        it('sollte die Tokens-Tabelle erstellen', async () => {
            await initializeTokenTable();

            expect(dbAsync.run).toHaveBeenCalledWith(
                expect.stringContaining('CREATE TABLE IF NOT EXISTS tokens')
            );
        });

        it('sollte Fehler bei der Tabellenerstellung behandeln', async () => {
            dbAsync.run.mockRejectedValueOnce(new Error('DB Error'));

            await expect(initializeTokenTable())
                .rejects
                .toThrow('DB Error');
        });
    });
}); 