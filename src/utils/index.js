const crypto = require('crypto');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return await bcrypt.hash(password, salt);
};

const verifyPassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

const generateRandomString = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

const createHash = (data) => {
    return crypto.createHash('sha256').update(data).digest('hex');
};

module.exports = {
    hashPassword,
    verifyPassword,
    generateRandomString,
    createHash
}; 