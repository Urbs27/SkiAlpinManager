const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 100, // Limit pro IP
  message: 'Zu viele Anfragen von dieser IP, bitte versuchen Sie es später erneut.'
});

module.exports = limiter; 