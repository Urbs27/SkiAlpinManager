const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

// Generiere ein geheimes 2FA-Schlüssel
const generateSecret = (user) => {
    return speakeasy.generateSecret({
        name: `Ski Alpin Manager (${user.email})`
    });
};

// Verifiziere einen 2FA-Token
const verifyToken = (secret, token) => {
    return speakeasy.totp.verify({
        secret: secret.base32,
        encoding: 'base32',
        token
    });
};

// Generiere einen QR-Code für die 2FA-App
const generateQRCode = async (otpauthUrl) => {
    try {
        return await qrcode.toDataURL(otpauthUrl);
    } catch (error) {
        console.error('Fehler beim Generieren des QR-Codes:', error);
        throw error;
    }
};

module.exports = {
    generateSecret,
    verifyToken,
    generateQRCode
}; 