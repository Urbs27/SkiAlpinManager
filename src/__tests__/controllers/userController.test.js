const UserController = require('../../controllers/userController');
const User = require('../../models/user');

describe('UserController', () => {
    let mockRequest;
    let mockResponse;

    beforeEach(() => {
        mockRequest = {
            params: {},
            body: {},
            session: { userId: 1 }
        };
        mockResponse = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
    });

    describe('getUserById', () => {
        test('sollte Benutzer erfolgreich abrufen', async () => {
            const mockUser = {
                id: 1,
                username: 'testuser',
                email: 'test@test.de'
            };

            mockRequest.params.id = '1';
            jest.spyOn(User, 'findById').mockResolvedValue(mockUser);

            await UserController.getUserById(mockRequest, mockResponse);

            expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
        });

        // Weitere getUserById-Tests...
    });

    // Weitere Controller-Methoden-Tests...
}); 