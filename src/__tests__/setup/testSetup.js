const { testDb, setupTestDatabase, teardownTestDatabase, clearTestData } = require('../../utils/testSetup');

describe('Test-Umgebung', () => {
    let originalDb;
    
    beforeEach(() => {
        originalDb = testDb.db;
        jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        testDb.db = originalDb;
        jest.restoreAllMocks();
    });

    test('sollte Verbindungsfehler behandeln', async () => {
        testDb.db = null; // Simuliere nicht-verbundene DB
        
        await expect(testDb.connect()).rejects.toThrow('Connection error');
        expect(console.error).toHaveBeenCalled();
    });

    test('sollte Datenbankoperationen testen', async () => {
        const mockData = { id: 1, name: 'Test' };
        
        testDb.db = {
            get: jest.fn((sql, params, callback) => callback(null, mockData))
        };

        const result = await testDb.query('SELECT * FROM test');
        expect(result).toBeDefined();
        expect(result).toEqual(mockData);
    });

    test('sollte Setup-Fehler behandeln', async () => {
        testDb.db = {
            exec: jest.fn((sql, callback) => callback(new Error('Setup error')))
        };

        await expect(setupTestDatabase()).rejects.toThrow('Setup error');
        expect(console.error).toHaveBeenCalled();
    });

    test('sollte Teardown-Fehler behandeln', async () => {
        testDb.db = {
            close: jest.fn((callback) => callback(new Error('Teardown error')))
        };

        await expect(teardownTestDatabase()).rejects.toThrow('Teardown error');
        expect(console.error).toHaveBeenCalled();
    });

    test('sollte Query-Fehler behandeln', async () => {
        testDb.db = {
            get: jest.fn((sql, params, callback) => 
                callback(new Error('Query error')))
        };

        await expect(testDb.query('SELECT * FROM test'))
            .rejects.toThrow('Query error');
        expect(console.error).toHaveBeenCalled();
    });

    test('sollte clearTables-Fehler behandeln', async () => {
        testDb.db = {
            exec: jest.fn((sql, callback) => 
                callback(new Error('Clear error')))
        };

        await expect(clearTestData()).rejects.toThrow('Clear error');
        expect(console.error).toHaveBeenCalled();
    });
}); 