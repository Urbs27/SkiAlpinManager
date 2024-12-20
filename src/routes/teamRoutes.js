const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, teamController.getTeams);
router.post('/', isAuthenticated, teamController.createTeam);

module.exports = router; 