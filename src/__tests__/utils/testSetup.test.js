const { testDb, setupTestDatabase, teardownTestDatabase, clearTestData } = require('../../utils/testSetup');

jest.setTimeout(60000);

describe('Test Setup', () => {
  test('should provide database connection functions', async () => {
    try {
      await setupTestDatabase();
      
      // Überprüfe, ob die Datenbank-Instanz und ihre Funktionen verfügbar sind
      expect(testDb).toBeDefined();
      expect(typeof testDb.connect).toBe('function');
      expect(typeof testDb.close).toBe('function');
      expect(typeof testDb.clearTables).toBe('function');
      
      // Teste clearTestData
      await clearTestData();
      
      // Überprüfe, ob die Helper-Funktionen verfügbar sind
      expect(typeof setupTestDatabase).toBe('function');
      expect(typeof teardownTestDatabase).toBe('function');
      expect(typeof clearTestData).toBe('function');
      
      // Cleanup
      await teardownTestDatabase();
    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  }, 60000);
}); 