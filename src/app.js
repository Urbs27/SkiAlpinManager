const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const routes = require('./routes');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const athletesRouter = require('./routes/api/athletes');
const teamRouter = require('./routes/team');

const app = express();

app.use(compression());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 Minuten
    max: 100 // Limit pro IP
});
app.use(limiter);

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ charset: 'utf-8' }));
app.use(express.urlencoded({ 
    extended: true,
    charset: 'utf-8'
}));

const sessionConfig = {
    store: new SQLiteStore({
        db: 'sessions.db',
        dir: './data'
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'strict'
    },
    name: 'sessionId'
};

app.use(session(sessionConfig));

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

app.use('/', routes);
app.use('/api/athletes', athletesRouter);
app.use('/team', teamRouter);

app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route nicht gefunden'
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' 
        ? 'Ein Fehler ist aufgetreten'
        : err.message;

    res.status(statusCode).json({
        status: 'error',
        message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

// EJS Template Engine
app.set('view engine', 'ejs');
app.locals.charset = 'utf-8';

// Statische Dateien
app.use(express.static('public', {
    charset: 'utf-8',
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css; charset=utf-8');
        }
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        }
    }
}));

// Globale Response Headers
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    next();
});

module.exports = app; 