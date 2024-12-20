const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redisClient = require('../config/redis');

const sessionConfig = session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 1 Tag
    }
});

module.exports = sessionConfig; 