const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { validationRules, validate } = require('../middleware/validation');
const userController = require('../controllers/userController');
const athleteController = require('../controllers/athleteController');

// Middleware für API-Routen
router.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
});

// Authentifizierungsrouten
router.post('/auth/login', validate(validationRules.login), userController.login);
router.post('/auth/register', validate(validationRules.register), userController.register);

// Athletenrouten
router.get('/athletes', authMiddleware.api, athleteController.getAll);
router.get('/athletes/:id', authMiddleware.api, athleteController.getById);

// Benutzerrouten
router.get('/users/:id', authMiddleware.api, userController.getUserById);
router.put('/users/:id', authMiddleware.api, validate(validationRules.updateUser), userController.updateUser);
router.delete('/users/:id', authMiddleware.api, userController.deleteUser);

module.exports = router;