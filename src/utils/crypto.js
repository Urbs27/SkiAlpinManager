const crypto = require('crypto');
const bcrypt = require('bcrypt');

// Konstanten für die Verschlüsselung
const SALT_ROUNDS = 10;
const HASH_ALGORITHM = 'sha256';
const ENCODING = 'hex';

// Passwort hashen
const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const hash = await bcrypt.hash(password, salt);
        return hash;
    } catch (error) {
        console.error('Fehler beim Hashen des Passworts:', error);
        throw error;
    }
};

// Passwort verifizieren
const verifyPassword = async (password, hash) => {
    try {
        return await bcrypt.compare(password, hash);
    } catch (error) {
        console.error('Fehler beim Verifizieren des Passworts:', error);
        throw error;
    }
};

// Zufälligen String generieren
const generateRandomString = (length = 32) => {
    return crypto.randomBytes(length).toString(ENCODING);
};

// Hash für einen String erstellen
const createHash = (data) => {
    return crypto
        .createHash(HASH_ALGORITHM)
        .update(data)
        .digest(ENCODING);
};

// Sicheren Token generieren
const generateSecureToken = () => {
    return generateRandomString(32);
};

module.exports = {
    hashPassword,
    verifyPassword,
    generateRandomString,
    createHash,
    generateSecureToken
}; 