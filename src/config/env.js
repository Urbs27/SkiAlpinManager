require('dotenv').config();

const config = {
    app: {
        port: process.env.APP_PORT || 3000,
        env: process.env.NODE_ENV || 'development'
    },
    db: {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT
    },
    auth: {
        jwtSecret: process.env.JWT_SECRET,
        tokenExpiry: process.env.TOKEN_EXPIRY || '1h'
    },
    mail: {
        service: process.env.MAIL_SERVICE,
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
};

module.exports = config; 