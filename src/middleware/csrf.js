const csrf = require('csurf');

// Konfiguriere CSRF-Schutz
const csrfProtection = csrf({
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }
});

// Middleware zum Hinzufügen des CSRF-Tokens zu res.locals
const addCsrfToken = (req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
};

// Error-Handler für CSRF-Fehler
const handleCsrfError = (err, req, res, next) => {
    if (err.code !== 'EBADCSRFTOKEN') {
        return next(err);
    }

    // CSRF-Token stimmt nicht überein
    res.status(403).render('error', {
        error: 'Ungültiges oder fehlendes CSRF-Token',
        details: 'Bitte laden Sie die Seite neu und versuchen Sie es erneut.'
    });
};

module.exports = {
    csrfProtection,
    addCsrfToken,
    handleCsrfError
}; 