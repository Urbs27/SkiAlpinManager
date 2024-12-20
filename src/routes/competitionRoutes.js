const express = require('express');
const router = express.Router();
const CompetitionController = require('../controllers/competitionController');
const { isAuthenticated, isRaceOfficial, isFISDelegate } = require('../middleware/auth');

/**
 * Öffentliche Routes
 */

// Wettkampf-Übersicht
router.get('/', CompetitionController.showOverview);

// Wettkampf-Details
router.get('/:id', CompetitionController.showDetails);

// Startliste
router.get('/:id/startlist', CompetitionController.showStartList);

// Live-Timing
router.get('/:id/live', CompetitionController.showLiveTiming);

/**
 * Team-Manager Routes
 */

// Athleten für Wettkampf anmelden
router.post(
    '/:competitionId/register/:playerId',
    isAuthenticated,
    async (req, res, next) => {
        // Prüfe ob Athlet zum Team des Managers gehört
        const player = await Player.getById(req.params.playerId);
        const team = await Team.getById(player.team_id);
        if (team.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Keine Berechtigung' });
        }
        next();
    },
    CompetitionController.registerAthlete
);

// Athlet vom Wettkampf abmelden (nur vor Anmeldeschluss)
router.delete(
    '/:competitionId/register/:playerId',
    isAuthenticated,
    async (req, res, next) => {
        const player = await Player.getById(req.params.playerId);
        const team = await Team.getById(player.team_id);
        if (team.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Keine Berechtigung' });
        }
        next();
    },
    CompetitionController.unregisterAthlete
);

/**
 * Rennleitung Routes
 */

// Wettkampf-Status ändern
router.patch(
    '/:id/status',
    isAuthenticated,
    isRaceOfficial,
    CompetitionController.updateStatus
);

// Startliste generieren
router.post(
    '/:id/generate-startlist',
    isAuthenticated,
    isRaceOfficial,
    CompetitionController.generateStartList
);

// Ergebnisse aktualisieren
router.patch(
    '/:competitionId/results/:resultId',
    isAuthenticated,
    isRaceOfficial,
    CompetitionController.updateResults
);

// DNS/DNF/DSQ Status setzen
router.patch(
    '/:competitionId/results/:resultId/status',
    isAuthenticated,
    isRaceOfficial,
    CompetitionController.updateResultStatus
);

/**
 * FIS-Delegierte Routes
 */

// Wettkampf validieren
router.post(
    '/:id/validate',
    isAuthenticated,
    isFISDelegate,
    CompetitionController.validateCompetition
);

// FIS-Punkte bestätigen
router.post(
    '/:id/confirm-points',
    isAuthenticated,
    isFISDelegate,
    CompetitionController.confirmFISPoints
);

/**
 * API Routes für Live-Timing
 */

// Live-Zeiten abrufen
router.get(
    '/:id/live/times',
    CompetitionController.getLiveTimes
);

// Zwischenzeiten abrufen
router.get(
    '/:id/live/intermediate',
    CompetitionController.getIntermediateTimes
);

// WebSocket-Route für Live-Updates
// Wird in websocket.js konfiguriert

module.exports = router; 