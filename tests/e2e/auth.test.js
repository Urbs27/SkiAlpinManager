const request = require('supertest');
const app = require('../../src/app');

describe('Authentication Tests', () => {
    test('should login with valid credentials', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({
                username: 'testuser',
                password: 'testpass'
            });
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
    });
}); 