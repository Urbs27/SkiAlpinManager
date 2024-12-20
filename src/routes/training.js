const express = require('express');
const router = express.Router();
const Player = require('../models/player');
const Track = require('../models/track');
const { isAuthenticated } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');
const { validateTrainingSession } = require('../middleware/validation');

/**
 * Trainingsübersicht für einen Spieler
 */
router.get('/:playerId', [
    isAuthenticated,
    csrfProtection
], async (req, res) => {
    try {
        const player = await Player.getById(req.params.playerId);
        
        if (!player || player.userId !== req.session.userId) {
            return res.status(404).render('error', { 
                message: 'Skifahrer nicht gefunden' 
            });
        }

        const tracks = await Track.getAll();
        
        res.render('training/index', {
            title: `Training - ${player.name}`,
            player,
            tracks,
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        console.error('Training route error:', error);
        res.status(500).render('error', { message: error.message });
    }
});

/**
 * Training durchführen
 */
router.post('/:playerId/:trackId', [
    isAuthenticated,
    csrfProtection,
    validateTrainingSession
], async (req, res) => {
    try {
        const player = await Player.getById(req.params.playerId);
        const track = await Track.getById(req.params.trackId);

        // Validierungen
        if (!player || player.userId !== req.session.userId) {
            return res.status(404).render('error', { 
                message: 'Skifahrer nicht gefunden' 
            });
        }
        if (!track) {
            return res.status(404).render('error', { 
                message: 'Strecke nicht gefunden' 
            });
        }

        // Training durchführen
        const trainingTime = Track.calculateTrainingTime(track, player);
        const results = Track.calculateTrainingResults(track, player, trainingTime);

        // Spieler aktualisieren
        await Player.updateAfterTraining(player.id, results);

        res.render('training/results', {
            title: 'Trainingsergebnis',
            player,
            track,
            results,
            trainingTime,
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        console.error('Training execution error:', error);
        res.status(500).render('error', { message: error.message });
    }
});

/**
 * Trainingshistorie
 */
router.get('/:playerId/history', [
    isAuthenticated,
    csrfProtection
], async (req, res) => {
    try {
        const player = await Player.getById(req.params.playerId);
        
        if (!player || player.userId !== req.session.userId) {
            return res.status(404).render('error', { 
                message: 'Skifahrer nicht gefunden' 
            });
        }

        const history = await Player.getTrainingHistory(player.id);
        
        res.render('training/history', {
            title: `Trainingshistorie - ${player.name}`,
            player,
            history,
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        console.error('Training history error:', error);
        res.status(500).render('error', { message: error.message });
    }
});

/**
 * API-Endpunkte
 */
router.get('/:playerId/api/next-session', 
    isAuthenticated,
    async (req, res) => {
        try {
            const nextSession = await Player.getNextTrainingSession(req.params.playerId);
            res.json(nextSession);
        } catch (error) {
            console.error('API next session error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

router.get('/:playerId/api/performance-stats', 
    isAuthenticated,
    async (req, res) => {
        try {
            const stats = await Player.getPerformanceStats(req.params.playerId);
            res.json(stats);
        } catch (error) {
            console.error('API performance stats error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

module.exports = router; 