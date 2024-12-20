const crypto = require('crypto');
const { Token } = require('../models/token');

// Token-Typen
const TOKEN_TYPES = {
    RESET_PASSWORD: 'reset_password',
    EMAIL_VERIFICATION: 'email_verification'
};

/**
 * Generiert einen zufälligen Token
 */
const generateToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Erstellt einen neuen Token für einen Benutzer
 */
const createToken = async (userId, type, expiresInHours = 24) => {
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    await Token.create({
        userId,
        token,
        type,
        expiresAt: expiresAt.toISOString()
    });

    return token;
};

/**
 * Überprüft einen Token
 */
const verifyToken = async (token, type) => {
    const tokenRecord = await Token.findOne(token, type);
    return tokenRecord || null;
};

/**
 * Löscht einen Token
 */
const deleteToken = async (token, type) => {
    await Token.delete(token, type);
};

/**
 * Löscht abgelaufene Token
 */
const cleanupExpiredTokens = async () => {
    await Token.deleteExpired();
};

module.exports = {
    TOKEN_TYPES,
    generateToken,
    createToken,
    verifyToken,
    deleteToken,
    cleanupExpiredTokens
};