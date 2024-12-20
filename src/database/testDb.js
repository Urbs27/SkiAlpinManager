const sqlite3 = require('sqlite3').verbose();

class TestDatabase {
  constructor() {
    this.db = null;
  }

  async connect() {
    if (this.db) {
      await this.close();
    }

    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(':memory:', (err) => {
        if (err) {
          console.error('Connection error:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  _enableForeignKeys() {
    return new Promise((resolve, reject) => {
      this.db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) {
          console.error('Foreign Keys Fehler:', err);
          reject(err);
        } else {
          console.log('Foreign Keys aktiviert');
          resolve();
        }
      });
    });
  }

  async init() {
    if (!this.db) {
      await this.connect();
    }

    const schema = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        team_name TEXT,
        nationality TEXT,
        role TEXT DEFAULT 'user',
        status TEXT DEFAULT 'active',
        verified INTEGER DEFAULT 0,
        last_login DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE,
        budget INTEGER DEFAULT 1000000,
        reputation INTEGER DEFAULT 50,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        team_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS competition_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        competition_id INTEGER NOT NULL,
        player_id INTEGER NOT NULL,
        rank INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
      );
    `;

    return new Promise((resolve, reject) => {
      this.db.exec(schema, (err) => {
        if (err) {
          console.error('Schema creation error:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async get(sql, params = []) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async run(sql, params = []) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  async all(sql, params = []) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async clearTables() {
    if (!this.db) throw new Error('Database not connected');
    const sql = `
      DELETE FROM competition_results;
      DELETE FROM players;
      DELETE FROM teams;
      DELETE FROM users;
      DELETE FROM sqlite_sequence;
    `;

    return new Promise((resolve, reject) => {
      this.db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async close() {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else {
          this.db = null;
          resolve();
        }
      });
    });
  }
}

module.exports = TestDatabase;