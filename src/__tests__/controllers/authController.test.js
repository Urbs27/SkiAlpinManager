const AuthController = require('../../controllers/authController');
const User = require('../../models/user');
const Token = require('../../models/token');
const { hashPassword } = require('../../utils/crypto');

describe('AuthController', () => {
    let mockRequest;
    let mockResponse;

    beforeEach(() => {
        mockRequest = {
            body: {},
            session: {}
        };
        mockResponse = {
            render: jest.fn(),
            redirect: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
    });

    describe('Login', () => {
        test('sollte erfolgreichen Login durchführen', async () => {
            const hashedPassword = await hashPassword('test123');
            const mockUser = {
                id: 1,
                email: 'test@test.de',
                password: hashedPassword
            };

            mockRequest.body = {
                email: 'test@test.de',
                password: 'test123'
            };

            jest.spyOn(User, 'findByEmail').mockResolvedValue(mockUser);

            await AuthController.login(mockRequest, mockResponse);

            expect(mockRequest.session.userId).toBe(mockUser.id);
            expect(mockResponse.redirect).toHaveBeenCalledWith('/dashboard');
        });

        // Weitere Login-Tests...
    });

    describe('E-Mail-Verifizierung', () => {
        test('sollte E-Mail erfolgreich verifizieren', async () => {
            const mockToken = {
                userId: 1,
                type: 'email_verification'
            };

            mockRequest.params = { token: 'valid-token' };
            
            jest.spyOn(Token, 'findOne').mockResolvedValue(mockToken);
            jest.spyOn(User.prototype, 'update').mockResolvedValue();

            await AuthController.verifyEmail(mockRequest, mockResponse);

            expect(User.prototype.update).toHaveBeenCalledWith({
                emailVerified: true
            });
            expect(mockResponse.redirect).toHaveBeenCalledWith('/login');
        });

        // Weitere Verifizierungs-Tests...
    });
}); 