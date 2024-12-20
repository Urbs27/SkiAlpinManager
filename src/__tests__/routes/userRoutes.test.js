const request = require('supertest');
const app = require('../../app');
const testDb = require('../../database/testDb');

describe('User Routes', () => {
  let authCookie;

  beforeAll(async () => {
    await testDb.connect();
    await testDb.init();
  });

  afterAll(async () => {
    await testDb.close();
  });

  beforeEach(async () => {
    await testDb.clearTables();

    // Test-User erstellen und einloggen
    await request(app)
      .post('/auth/register')
      .send({
        email: 'test@test.com',
        username: 'testuser',
        password: 'Test123!'
      });

    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@test.com',
        password: 'Test123!'
      });

    authCookie = loginResponse.headers['set-cookie'];
  });

  describe('GET /users/:id', () => {
    test('should get user by ID when authenticated', async () => {
      const response = await request(app)
        .get('/users/1')
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('email', 'test@test.com');
    });

    test('should fail when not authenticated', async () => {
      const response = await request(app)
        .get('/users/1');

      expect(response.status).toBe(401);
    });
  });
}); 