const { dbAsync } = require('../config/database');

class Token {
    /**
     * Token erstellen
     */
    static async create(tokenData) {
        const { userId, token, type, expiresAt } = tokenData;
        
        const result = await dbAsync.run(`
            INSERT INTO tokens (
                user_id, token, type, expires_at, created_at
            ) VALUES (?, ?, ?, ?, datetime('now'))
        `, [userId, token, type, expiresAt]);

        return result.lastID;
    }

    /**
     * Token nach Wert und Typ finden
     */
    static async findOne(token, type) {
        return await dbAsync.get(
            'SELECT * FROM tokens WHERE token = ? AND type = ? AND expires_at > datetime("now")',
            [token, type]
        );
    }

    /**
     * Token löschen
     */
    static async delete(token, type) {
        await dbAsync.run(
            'DELETE FROM tokens WHERE token = ? AND type = ?',
            [token, type]
        );
    }

    /**
     * Abgelaufene Token löschen
     */
    static async deleteExpired() {
        await dbAsync.run(
            'DELETE FROM tokens WHERE expires_at <= datetime("now")'
        );
    }
}

// Füge die Tokens-Tabelle zur Datenbankinitialisierung hinzu
const initializeTokenTable = async () => {
    await dbAsync.run(`
        CREATE TABLE IF NOT EXISTS tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT NOT NULL UNIQUE,
            type TEXT NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    `);
};

module.exports = {
    Token,
    initializeTokenTable
}; 