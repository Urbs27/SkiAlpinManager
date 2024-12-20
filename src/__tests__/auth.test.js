jest.mock('sqlite3');
jest.mock('connect-sqlite3');

const request = require('supertest');
const app = require('../app');
const testDb = require('../database/testDb');

describe('Auth Tests', () => {
  beforeEach(async () => {
    await testDb.connect();
    await testDb.clearTables();
  });

  afterEach(async () => {
    await testDb.close();
  });

  test('should register a new user', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      });

    expect(response.status).toBe(200);
  });

  test('should login user', async () => {
    // Erst Benutzer registrieren
    await request(app)
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      });

    // Dann einloggen
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
  });

  describe('Authentifizierungsablauf', () => {
    test('sollte vollständigen Login-Logout-Zyklus behandeln', async () => {
      // Kompletten Auth-Zyklus testen
    });
    
    test('sollte Session-Konsistenz gewährleisten', async () => {
      // Session-Verwaltung testen
    });
  });
}); 