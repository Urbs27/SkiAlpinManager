const { dbAsync } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
    /**
     * Neuen Ski-Team-Manager erstellen
     * @throws {Error} Wenn Manager bereits existiert
     */
    static async create(userData) {
        try {
            const { username, email, password, teamName, nationality } = userData;
            
            // Prüfe ob Manager bereits existiert
            const existingUser = await dbAsync.get(
                'SELECT id FROM users WHERE username = ? OR email = ?',
                [username, email]
            );
            
            if (existingUser) {
                throw new Error('Benutzername oder E-Mail bereits vergeben');
            }

            // Hash das Passwort
            const hashedPassword = await bcrypt.hash(password, 10);

            // Erstelle den Manager und sein Team
            const result = await dbAsync.run(`
                INSERT INTO users (
                    username, email, password, team_name, nationality,
                    role, status, created_at
                ) VALUES (?, ?, ?, ?, ?, 'manager', 'active', datetime('now'))
            `, [username, email, hashedPassword, teamName, nationality]);

            // Erstelle automatisch ein Team für den Manager
            await dbAsync.run(`
                INSERT INTO teams (
                    user_id, budget, reputation, 
                    season_wins, total_races, created_at
                ) VALUES (?, 1000000, 50, 0, 0, datetime('now'))
            `, [result.lastID]);

            return result.lastID;
        } catch (error) {
            throw new Error(`Fehler beim Erstellen des Team-Managers: ${error.message}`);
        }
    }

    /**
     * Team-Manager Statistiken abrufen
     */
    static async getStats(id) {
        try {
            const stats = await dbAsync.get(`
                SELECT 
                    t.budget,
                    t.reputation,
                    t.season_wins,
                    t.total_races,
                    COUNT(DISTINCT p.id) as athlete_count,
                    (SELECT COUNT(*) FROM competition_results r 
                     JOIN players p2 ON r.player_id = p2.id 
                     WHERE p2.team_id = t.id AND r.rank = 1) as total_wins
                FROM users u
                JOIN teams t ON u.id = t.user_id
                LEFT JOIN players p ON t.id = p.team_id
                WHERE u.id = ? AND u.status = 'active'
                GROUP BY u.id
            `, [id]);

            return stats || {
                budget: 1000000,
                reputation: 50,
                season_wins: 0,
                total_races: 0,
                athlete_count: 0,
                total_wins: 0
            };
        } catch (error) {
            throw new Error(`Fehler beim Abrufen der Team-Statistiken: ${error.message}`);
        }
    }

    /**
     * Benutzer authentifizieren
     * @returns {Object|null} Benutzer-Objekt oder null
     */
    static async authenticate(username, password) {
        try {
            const user = await dbAsync.get(
                'SELECT * FROM users WHERE username = ? AND status = "active"',
                [username]
            );

            if (!user) return null;

            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) return null;

            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        } catch (error) {
            throw new Error(`Authentifizierungsfehler: ${error.message}`);
        }
    }

    /**
     * Benutzer nach ID abrufen
     * @throws {Error} Wenn Benutzer nicht gefunden
     */
    static async getById(id) {
        try {
            const user = await dbAsync.get(
                'SELECT * FROM users WHERE id = ? AND status = "active"',
                [id]
            );
            if (!user) throw new Error('Benutzer nicht gefunden');
            
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        } catch (error) {
            throw new Error(`Fehler beim Abrufen des Benutzers: ${error.message}`);
        }
    }

    /**
     * Benutzer aktualisieren
     * @throws {Error} Wenn Update fehlschlägt
     */
    static async update(id, updateData) {
        try {
            const updates = [];
            const values = [];

            for (const [key, value] of Object.entries(updateData)) {
                if (key === 'password') {
                    updates.push(`${key} = ?`);
                    values.push(await bcrypt.hash(value, 10));
                } else {
                    updates.push(`${key} = ?`);
                    values.push(value);
                }
            }

            updates.push('updated_at = datetime("now")');
            values.push(id);

            const result = await dbAsync.run(`
                UPDATE users 
                SET ${updates.join(', ')}
                WHERE id = ? AND status = "active"
            `, values);

            if (result.changes === 0) {
                throw new Error('Benutzer nicht gefunden oder inaktiv');
            }
        } catch (error) {
            throw new Error(`Fehler beim Aktualisieren des Benutzers: ${error.message}`);
        }
    }

    /**
     * Benutzer deaktivieren
     * @throws {Error} Wenn Deaktivierung fehlschlägt
     */
    static async deactivate(id) {
        try {
            const result = await dbAsync.run(
                'UPDATE users SET status = "inactive", updated_at = datetime("now") WHERE id = ? AND status = "active"',
                [id]
            );
            if (result.changes === 0) {
                throw new Error('Benutzer nicht gefunden oder bereits inaktiv');
            }
        } catch (error) {
            throw new Error(`Fehler beim Deaktivieren des Benutzers: ${error.message}`);
        }
    }

    /**
     * Benutzer löschen
     * @throws {Error} Wenn Löschung fehlschlägt
     */
    static async delete(id) {
        try {
            const result = await dbAsync.run(
                'DELETE FROM users WHERE id = ? AND status = "active"',
                [id]
            );
            if (result.changes === 0) {
                throw new Error('Benutzer nicht gefunden oder bereits inaktiv');
            }
        } catch (error) {
            throw new Error(`Fehler beim Löschen des Benutzers: ${error.message}`);
        }
    }
}

module.exports = User; 