const express = require('express');
const router = express.Router();
const Race = require('../models/race');
const Player = require('../models/player');
const { isAuthenticated, isRaceOfficial } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');
const { validateRaceRegistration } = require('../middleware/validation');

/**
 * Rennen-Übersicht
 */
router.get('/', [
    isAuthenticated,
    csrfProtection
], async (req, res) => {
    try {
        const races = await Race.getAll();
        const players = await Player.getByUserId(req.session.userId);
        
        res.render('race/index', { 
            title: 'Rennen',
            races,
            players: players || [],
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        console.error('Error in race route:', error);
        res.status(500).render('error', { error: error.message });
    }
});

/**
 * Rennen-Details
 */
router.get('/:id', [
    isAuthenticated,
    csrfProtection
], async (req, res) => {
    try {
        const race = await Race.getById(req.params.id);
        const participants = await Race.getParticipants(req.params.id);
        const weather = await Race.getWeatherConditions(req.params.id);
        
        res.render('race/details', {
            title: race.name,
            race,
            participants,
            weather,
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

/**
 * Rennen-Anmeldung
 */
router.post('/:raceId/register', [
    isAuthenticated,
    csrfProtection,
    validateRaceRegistration
], async (req, res) => {
    try {
        const { playerId } = req.body;
        const raceId = req.params.raceId;

        await Race.registerPlayer(raceId, playerId);
        res.redirect(`/race/${raceId}`);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

/**
 * Rennergebnisse
 */
router.get('/:id/results', [
    isAuthenticated,
    csrfProtection
], async (req, res) => {
    try {
        const race = await Race.getById(req.params.id);
        const results = await Race.getResults(req.params.id);
        const intermediates = await Race.getIntermediates(req.params.id);
        
        res.render('race/results', {
            title: 'Rennergebnisse',
            race,
            results,
            intermediates,
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        console.error('Results error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

/**
 * Rennleitung Funktionen
 */
router.post('/:id/start', [
    isAuthenticated,
    isRaceOfficial,
    csrfProtection
], async (req, res) => {
    try {
        await Race.startRace(req.params.id);
        res.redirect(`/race/${req.params.id}/live`);
    } catch (error) {
        console.error('Race start error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

router.post('/:id/cancel', [
    isAuthenticated,
    isRaceOfficial,
    csrfProtection
], async (req, res) => {
    try {
        const { reason } = req.body;
        await Race.cancelRace(req.params.id, reason);
        res.redirect(`/race/${req.params.id}`);
    } catch (error) {
        console.error('Race cancellation error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

/**
 * Live-Timing
 */
router.get('/:id/live', [
    isAuthenticated,
    csrfProtection
], async (req, res) => {
    try {
        const race = await Race.getById(req.params.id);
        const startList = await Race.getStartList(req.params.id);
        
        res.render('race/live', {
            title: 'Live-Timing',
            race,
            startList,
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        console.error('Live timing error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

/**
 * Zeitnahme und Resultate
 */
router.post('/:id/time', [
    isAuthenticated,
    isRaceOfficial,
    csrfProtection
], async (req, res) => {
    try {
        const { startNumber, time, type } = req.body;
        await Race.recordTime(req.params.id, startNumber, time, type);
        res.json({ success: true });
    } catch (error) {
        console.error('Time recording error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Disqualifikationen
 */
router.post('/:id/disqualify', [
    isAuthenticated,
    isRaceOfficial,
    csrfProtection
], async (req, res) => {
    try {
        const { startNumber, reason, rule } = req.body;
        await Race.disqualifyParticipant(req.params.id, startNumber, reason, rule);
        res.redirect(`/race/${req.params.id}/results`);
    } catch (error) {
        console.error('Disqualification error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

module.exports = router; 