jest.mock('sqlite3');
jest.mock('connect-sqlite3');

const request = require('supertest');
const app = require('../app');
const testDb = require('../database/testDb');

describe('App Tests', () => {
  beforeEach(async () => {
    await testDb.connect();
    await testDb.clearTables();
  });

  afterEach(async () => {
    await testDb.close();
  });

  test('should respond to health check', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  test('should protect authenticated routes', async () => {
    const response = await request(app).get('/dashboard');
    expect(response.status).toBe(302); // Redirect to login
  });
}); 