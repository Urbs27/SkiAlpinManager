const { getUserById } = require('../controllers/userController');
const testDb = require('../database/testDb');

jest.mock('../database/testDb', () => ({
    db: {
        get: jest.fn()
    }
}));

describe('User Controller Tests', () => {
    let mockRequest;
    let mockResponse;
    
    beforeEach(() => {
        jest.clearAllMocks();
        mockRequest = {
            params: {},
            body: {}
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    test('should get user by ID', async () => {
        const mockUser = { id: 1, email: 'test@test.com', username: 'testuser' };
        testDb.db.get.mockImplementation((query, params, callback) => callback(null, mockUser));

        mockRequest.params.id = '1';
        await getUserById(mockRequest, mockResponse);

        expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });

    // ... weitere Tests bleiben gleich
}); 