const { hashPassword, verifyPassword, generateRandomString, createHash, generateSecureToken } = require('../../utils/crypto');
const bcrypt = require('bcrypt');

jest.mock('bcrypt', () => ({
    genSalt: jest.fn().mockResolvedValue('mocksalt'),
    hash: jest.fn().mockResolvedValue('hashedpassword'),
    compare: jest.fn()
}));

describe('Crypto Utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('hashPassword', () => {
        test('should hash password successfully', async () => {
            const password = 'test123';
            const result = await hashPassword(password);

            expect(result).toBe('hashedpassword');
            expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
            expect(bcrypt.hash).toHaveBeenCalledWith(password, 'mocksalt');
        });

        test('should handle hashing errors', async () => {
            bcrypt.genSalt.mockRejectedValue(new Error('Hashing failed'));

            await expect(hashPassword('test123'))
                .rejects.toThrow('Hashing failed');
        });
    });

    describe('verifyPassword', () => {
        test('should verify correct password', async () => {
            bcrypt.compare.mockResolvedValue(true);
            const result = await verifyPassword('test123', 'hashedpassword');
            expect(result).toBe(true);
        });

        test('should reject incorrect password', async () => {
            bcrypt.compare.mockResolvedValue(false);
            const result = await verifyPassword('wrong', 'hashedpassword');
            expect(result).toBe(false);
        });
    });

    describe('generateRandomString', () => {
        test('should generate string of specified length', () => {
            const result = generateRandomString(16);
            expect(result).toHaveLength(32); // Hex encoding doubles length
        });

        test('should generate different strings', () => {
            const str1 = generateRandomString();
            const str2 = generateRandomString();
            expect(str1).not.toBe(str2);
        });
    });

    describe('createHash', () => {
        test('should create consistent hash', () => {
            const data = 'test123';
            const hash1 = createHash(data);
            const hash2 = createHash(data);
            expect(hash1).toBe(hash2);
        });
    });

    describe('generateSecureToken', () => {
        test('should generate token of correct length', () => {
            const token = generateSecureToken();
            expect(token).toHaveLength(64); // 32 bytes in hex = 64 chars
        });
    });
}); 