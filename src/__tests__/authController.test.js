const AuthController = require('../controllers/authController');
const { dbAsync } = require('../config/database');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/tokens');
const { sendVerificationEmail } = require('../utils/mailer');

// Mocks
jest.mock('../config/database', () => ({
    dbAsync: {
        get: jest.fn(),
        run: jest.fn().mockResolvedValue({ lastID: 1 }),
        all: jest.fn()
    }
}));
jest.mock('bcrypt');
jest.mock('../utils/tokens');
jest.mock('../utils/mailer');

describe('AuthController', () => {
    let mockRequest;
    let mockResponse;

    beforeEach(() => {
        mockRequest = {
            body: {},
            session: {},
            params: {},
            render: jest.fn()
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            render: jest.fn().mockReturnThis(),
            redirect: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('showLogin', () => {
        test('should render login page', async () => {
            await AuthController.showLogin(mockRequest, mockResponse);

            expect(mockResponse.render).toHaveBeenCalledWith('auth/login', {
                title: 'Login - Ski Alpin Manager',
                error: null
            });
        });
    });

    describe('login', () => {
        const validCredentials = {
            username: 'testuser',
            password: 'Test123!'
        };

        test('should login successfully', async () => {
            const mockUser = { id: 1, username: 'testuser', password: 'hashedPassword' };
            mockRequest.body = validCredentials;
            dbAsync.get.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);

            await AuthController.login(mockRequest, mockResponse);

            expect(mockRequest.session.userId).toBe(1);
            expect(mockResponse.redirect).toHaveBeenCalledWith('/team');
        });

        test('should handle invalid credentials', async () => {
            mockRequest.body = validCredentials;
            dbAsync.get.mockResolvedValue(null);

            await AuthController.login(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.render).toHaveBeenCalledWith('auth/login', {
                title: 'Login - Ski Alpin Manager',
                error: 'Ungültiger Benutzername oder Passwort'
            });
        });

        test('should handle database errors', async () => {
            mockRequest.body = validCredentials;
            dbAsync.get.mockRejectedValue(new Error('DB Error'));

            await AuthController.login(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.render).toHaveBeenCalledWith('error', {
                title: 'Fehler',
                error: 'Ein Fehler ist aufgetreten'
            });
        });
    });

    describe('logout', () => {
        test('should logout successfully', async () => {
            mockRequest.session.destroy = jest.fn(cb => cb());

            await AuthController.logout(mockRequest, mockResponse);

            expect(mockResponse.redirect).toHaveBeenCalledWith('/auth/login');
        });

        test('should handle logout errors', async () => {
            mockRequest.session.destroy = jest.fn(cb => cb(new Error('Session Error')));

            await AuthController.logout(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.render).toHaveBeenCalledWith('error', {
                title: 'Fehler',
                error: 'Interner Serverfehler'
            });
        });
    });

    describe('verifyEmail', () => {
        test('should verify email successfully', async () => {
            mockRequest.params.token = 'validToken';
            generateToken.mockReturnValue({ userId: 1 });

            await AuthController.verifyEmail(mockRequest, mockResponse);

            expect(dbAsync.run).toHaveBeenCalledWith(
                expect.any(String),
                [1]
            );
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'E-Mail erfolgreich verifiziert'
            });
        });

        test('should handle invalid token', async () => {
            mockRequest.params.token = 'invalidToken';
            generateToken.mockReturnValue(null);

            await AuthController.verifyEmail(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Ungültiger oder abgelaufener Token'
            });
        });
    });
}); 