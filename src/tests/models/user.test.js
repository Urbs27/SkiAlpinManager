const User = require('../../models/user');
const { dbAsync } = require('../../config/database');
const bcrypt = require('bcrypt');

// Mocks
jest.mock('../../config/database', () => ({
    dbAsync: {
        get: jest.fn(),
        run: jest.fn().mockResolvedValue({ lastID: 1 }),
        all: jest.fn()
    }
}));

jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashedPassword'),
    compare: jest.fn().mockResolvedValue(true)
}));

describe('User Model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('sollte einen neuen Benutzer erstellen', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                teamName: 'Test Team',
                nationality: 'Deutschland'
            };

            // Mock: Kein existierender Benutzer
            dbAsync.get.mockResolvedValueOnce(null);

            const userId = await User.create(userData);

            expect(userId).toBe(1);
            expect(dbAsync.run).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO users'),
                expect.arrayContaining([
                    userData.username,
                    userData.email,
                    userData.password,
                    userData.teamName,
                    userData.nationality
                ])
            );
        });

        it('sollte Fehler werfen wenn Benutzer bereits existiert', async () => {
            const userData = {
                username: 'existinguser',
                email: 'existing@example.com',
                password: 'password123'
            };

            // Mock: Existierender Benutzer
            dbAsync.get.mockResolvedValueOnce({ id: 1 });

            await expect(User.create(userData))
                .rejects
                .toThrow('Benutzername oder E-Mail bereits vergeben');

            // Prüfen ob keine INSERT-Operation ausgeführt wurde
            expect(dbAsync.run).not.toHaveBeenCalled();
        });

        it('sollte Fehler bei der Benutzer-Erstellung behandeln', async () => {
            const userData = {
                username: 'erroruser',
                email: 'error@example.com',
                password: 'password123'
            };

            dbAsync.get.mockResolvedValueOnce(null);
            dbAsync.run.mockRejectedValueOnce(new Error('DB Error'));

            await expect(User.create(userData))
                .rejects
                .toThrow('DB Error');
        });
    });

    describe('authenticate', () => {
        it('sollte einen Benutzer erfolgreich authentifizieren', async () => {
            const mockUser = {
                id: 1,
                username: 'testuser',
                password: 'hashedPassword',
                status: 'active'
            };

            dbAsync.get.mockResolvedValueOnce(mockUser);
            bcrypt.compare.mockResolvedValueOnce(true);

            const user = await User.authenticate('testuser', 'correctPassword');

            expect(user).toBeTruthy();
            expect(user.password).toBeUndefined();
            expect(dbAsync.run).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE users SET last_login'),
                [mockUser.id]
            );
        });

        it('sollte null zurückgeben bei falschen Anmeldedaten', async () => {
            const mockUser = {
                id: 1,
                username: 'testuser',
                password: 'hashedPassword',
                status: 'active'
            };

            dbAsync.get.mockResolvedValueOnce(mockUser);
            bcrypt.compare.mockResolvedValueOnce(false);

            const user = await User.authenticate('testuser', 'wrongPassword');

            expect(user).toBeNull();
            expect(dbAsync.run).not.toHaveBeenCalled();
        });

        it('sollte null zurückgeben wenn Benutzer nicht existiert', async () => {
            dbAsync.get.mockResolvedValueOnce(null);

            const user = await User.authenticate('nonexistent', 'password');

            expect(user).toBeNull();
            expect(bcrypt.compare).not.toHaveBeenCalled();
        });
    });

    describe('getById', () => {
        it('sollte Benutzer mit Team-Informationen zurückgeben', async () => {
            const mockUser = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                team_id: 1,
                budget: 1000000,
                reputation: 50
            };

            dbAsync.get.mockResolvedValueOnce(mockUser);

            const user = await User.getById(1);

            expect(user).toEqual(mockUser);
            expect(dbAsync.get).toHaveBeenCalledWith(
                expect.stringContaining('LEFT JOIN teams'),
                [1]
            );
        });
    });

    describe('update', () => {
        it('sollte Benutzerdaten aktualisieren', async () => {
            const updateData = {
                email: 'new@example.com',
                team_name: 'New Team',
                nationality: 'Österreich'
            };

            await User.update(1, updateData);

            expect(dbAsync.run).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE users'),
                expect.arrayContaining([
                    updateData.email,
                    updateData.team_name,
                    updateData.nationality,
                    1
                ])
            );
        });

        it('sollte Passwort sicher aktualisieren', async () => {
            const updateData = {
                password: 'newPassword123'
            };

            await User.update(1, updateData);

            expect(bcrypt.hash).toHaveBeenCalledWith(updateData.password, 10);
            expect(dbAsync.run).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE users'),
                expect.arrayContaining(['hashedPassword', 1])
            );
        });
    });

    describe('getStats', () => {
        it('sollte Benutzerstatistiken zurückgeben', async () => {
            const mockStats = {
                player_count: 5,
                race_count: 10,
                wins: 3,
                avg_rank: 2.5,
                budget: 1000000,
                reputation: 75
            };

            dbAsync.get.mockResolvedValueOnce(mockStats);

            const stats = await User.getStats(1);

            expect(stats).toEqual(mockStats);
            expect(dbAsync.get).toHaveBeenCalledWith(
                expect.stringContaining('SELECT'),
                [1]
            );
        });
    });

    describe('deactivate', () => {
        it('sollte einen Benutzer deaktivieren', async () => {
            await User.deactivate(1);

            expect(dbAsync.run).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE users SET status = "inactive"'),
                [1]
            );
        });

        it('sollte Fehler bei der Deaktivierung behandeln', async () => {
            dbAsync.run.mockRejectedValueOnce(new Error('Deactivation Error'));

            await expect(User.deactivate(1))
                .rejects
                .toThrow('Deactivation Error');
        });
    });

    describe('Edge Cases und Fehlerbehandlung', () => {
        it('sollte leere Updates ignorieren', async () => {
            await User.update(1, {});
            expect(dbAsync.run).not.toHaveBeenCalled();
        });

        it('sollte mit fehlenden Statistiken umgehen', async () => {
            dbAsync.get.mockResolvedValueOnce(null);
            
            const stats = await User.getStats(1);
            
            expect(stats).toBeNull();
        });

        it('sollte inaktive Benutzer nicht authentifizieren', async () => {
            const inactiveUser = {
                id: 1,
                username: 'inactive',
                password: 'hashedPassword',
                status: 'inactive'
            };

            // Mock: Benutzer wird nicht gefunden, weil Status nicht "active"
            dbAsync.get.mockResolvedValueOnce(null);

            const user = await User.authenticate('inactive', 'password');
            
            expect(user).toBeNull();
            // bcrypt.compare sollte nicht aufgerufen werden
            expect(bcrypt.compare).not.toHaveBeenCalled();
            // Kein last_login Update
            expect(dbAsync.run).not.toHaveBeenCalled();
        });

        it('sollte Fehler bei der Passwort-Aktualisierung behandeln', async () => {
            bcrypt.hash.mockRejectedValueOnce(new Error('Hash Error'));

            await expect(User.update(1, { password: 'newpass' }))
                .rejects
                .toThrow('Hash Error');
        });

        it('sollte Fehler bei der Benutzerabfrage behandeln', async () => {
            dbAsync.get.mockRejectedValueOnce(new Error('DB Error'));

            await expect(User.getById(1))
                .rejects
                .toThrow('DB Error');
        });
    });
}); 