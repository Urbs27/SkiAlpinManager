const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const securityMiddleware = [
  // Basis-Sicherheit
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
        imgSrc: ["'self'", "data:", "*.fis-ski.com", "*.ski-alpin-manager.com"],
        connectSrc: ["'self'", "wss:", "ws:"] // Für Live-Timing WebSocket
      }
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true
  }),

  // Rate Limiting für API
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 Minuten
    max: 100 // Limit pro IP
  }),

  // Spezielle Rate Limits für Live-Timing
  rateLimit({
    windowMs: 1000, // 1 Sekunde
    max: 10, // 10 Requests pro Sekunde
    handler: (req, res) => {
      res.status(429).json({
        error: 'Zu viele Anfragen für Live-Timing'
      });
    }
  }).unless({ path: ['/api/v1/races'] }),

  // Custom Headers für Ski-Alpin Manager
  (req, res, next) => {
    res.setHeader('X-Ski-Manager-Version', '1.0.0');
    next();
  }
];

module.exports = securityMiddleware; 