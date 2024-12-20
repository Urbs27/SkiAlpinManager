const request = require('supertest');
const app = require('../../app');
const testDb = require('../../database/testDb');

describe('Auth Routes', () => {
  beforeAll(async () => {
    await testDb.connect();
    await testDb.init();
  });

  afterAll(async () => {
    await testDb.close();
  });

  beforeEach(async () => {
    await testDb.clearTables();
  });

  describe('POST /auth/register', () => {
    test('should register a new user', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          username: 'testuser',
          password: 'Test123!'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
    });

    test('should fail with missing data', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'All fields are required');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Test-User erstellen
      await request(app)
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          username: 'testuser',
          password: 'Test123!'
        });
    });

    test('should login successfully', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@test.com',
          password: 'Test123!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Logged in successfully');
      expect(response.headers).toHaveProperty('set-cookie');
    });

    test('should fail with wrong credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@test.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });
}); 