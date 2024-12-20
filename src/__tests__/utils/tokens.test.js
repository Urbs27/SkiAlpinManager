const { generateToken, verifyToken } = require('../../utils/tokens');
const Token = require('../../models/token');

describe('Token Utils', () => {
    test('sollte gültigen Token generieren', async () => {
        const userId = 1;
        const type = 'email_verification';

        const token = await generateToken(userId, type);

        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.length).toBeGreaterThan(0);
    });

    test('sollte Token verifizieren', async () => {
        const mockToken = {
            id: 1,
            userId: 1,
            type: 'email_verification',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        };

        jest.spyOn(Token, 'findOne').mockResolvedValue(mockToken);

        const result = await verifyToken('test-token', 'email_verification');

        expect(result).toBeDefined();
        expect(result.userId).toBe(mockToken.userId);
    });

    test('sollte abgelaufene Token erkennen', async () => {
        const mockToken = {
            id: 1,
            userId: 1,
            type: 'email_verification',
            expiresAt: new Date(Date.now() - 1000) // Bereits abgelaufen
        };

        jest.spyOn(Token, 'findOne').mockResolvedValue(mockToken);

        await expect(verifyToken('test-token', 'email_verification'))
            .rejects.toThrow('Token ist abgelaufen');
    });
}); 