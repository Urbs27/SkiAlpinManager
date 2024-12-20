const express = require('express');
const router = express.Router();
const competitionController = require('../controllers/competitionController');
const authMiddleware = require('../middleware/auth');

// Erstelle einen neuen Wettkampf
router.post('/create', authMiddleware.apiAdmin, competitionController.createCompetition);

// Füge einen Athleten zu einem Wettkampf hinzu
router.post('/add-athlete', authMiddleware.apiAdmin, competitionController.addAthlete);

// Simuliere einen Wettkampf
router.post('/simulate/:competitionId', authMiddleware.apiAdmin, competitionController.simulate);

module.exports = router; 