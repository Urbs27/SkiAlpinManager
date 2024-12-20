const sqlite3 = require('sqlite3').verbose();
let db;

describe('SQLite Database Tests', () => {
  jest.setTimeout(60000);

  beforeAll(async () => {
    return new Promise((resolve, reject) => {
      db = new sqlite3.Database(':memory:', async (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        try {
          await createTables();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  });

  afterAll(async () => {
    if (db) {
      return new Promise((resolve) => {
        db.close(() => resolve());
      });
    }
  });

  beforeEach(async () => {
    if (db) {
      return new Promise((resolve, reject) => {
        db.run('DELETE FROM test', (err) => {
          if (err) reject(err);
          resolve();
        });
      });
    }
  });

  async function createTables() {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, value TEXT)')
          .run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT UNIQUE, username TEXT, password TEXT)')
          .run('CREATE TABLE IF NOT EXISTS teams (id INTEGER PRIMARY KEY, name TEXT)', (err) => {
            if (err) reject(err);
            else resolve();
          });
      });
    });
  }

  test('should connect to database', async () => {
    expect(db).toBeDefined();
    
    const result = await new Promise((resolve, reject) => {
      db.get('SELECT 1 as value', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    expect(result.value).toBe(1);
  });

  test('should insert and retrieve data', async () => {
    const testValue = 'test value';
    
    await new Promise((resolve, reject) => {
      db.run('INSERT INTO test (value) VALUES (?)', [testValue], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const result = await new Promise((resolve, reject) => {
      db.get('SELECT value FROM test WHERE value = ?', [testValue], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    expect(result.value).toBe(testValue);
  });

  test('should handle database errors', async () => {
    await expect(
      new Promise((_, reject) => {
        db.run('INVALID SQL', (err) => {
          if (err) reject(err);
        });
      })
    ).rejects.toBeDefined();
  });

  test('should handle concurrent operations', async () => {
    const operations = Array(5).fill().map((_, i) => 
      new Promise((resolve, reject) => {
        db.run('INSERT INTO test (value) VALUES (?)', [`value${i}`], (err) => {
          if (err) reject(err);
          else resolve();
        });
      })
    );

    await Promise.all(operations);

    const count = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM test', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    expect(count).toBe(5);
  });
}); 