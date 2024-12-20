const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  console.error('Fehler:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validierungsfehler',
      details: err.details
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Nicht autorisiert',
      message: 'Bitte melden Sie sich an'
    });
  }

  res.status(500).json({
    error: 'Interner Serverfehler',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = errorHandler; 