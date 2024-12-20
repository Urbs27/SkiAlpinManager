const express = require('express');
const router = express.Router();
const Player = require('../models/player');
const { isAuthenticated } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');

/**
 * Spielerliste anzeigen
 */
router.get('/', [
    isAuthenticated,
    csrfProtection
], async (req, res) => {
    try {
        const players = await Player.getByUserId(req.session.userId);
        res.render('player/index', { 
            title: 'Meine Skifahrer',
            players,
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        console.error('Error in player route:', error);
        res.status(500).render('error', { error: error.message });
    }
});

/**
 * Formular zum Erstellen eines Spielers anzeigen
 */
router.get('/create', [
    isAuthenticated,
    csrfProtection
], (req, res) => {
    res.render('player/create', { 
        title: 'Neuer Skifahrer erstellen',
        csrfToken: req.csrfToken()
    });
});

/**
 * Spieler erstellen (POST)
 */
router.post('/create', [
    isAuthenticated,
    csrfProtection
], async (req, res) => {
    try {
        const playerData = {
            name: req.body.name,
            team: req.body.team,
            userId: req.session.userId
        };
        
        await Player.create(playerData);
        res.redirect('/player');
    } catch (error) {
        console.error('Error creating player:', error);
        res.status(500).render('error', { error: error.message });
    }
});

/**
 * Spielerdetails anzeigen
 */
router.get('/:id', [
    isAuthenticated,
    csrfProtection
], async (req, res) => {
    try {
        const player = await Player.getById(req.params.id);
        if (!player) {
            return res.status(404).render('error', { 
                error: 'Spieler nicht gefunden', 
                details: null 
            });
        }

        const results = await Player.getResults(req.params.id);
        res.render('player/details', { 
            title: player.name,
            player,
            results,
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { 
            error: error.message, 
            details: null 
        });
    }
});

/**
 * Spieler bearbeiten (GET)
 */
router.get('/:id/edit', [
    isAuthenticated,
    csrfProtection
], async (req, res) => {
    try {
        const player = await Player.getById(req.params.id);
        if (!player) {
            return res.status(404).render('error', { 
                error: 'Spieler nicht gefunden', 
                details: null 
            });
        }

        res.render('player/edit', { 
            title: `Bearbeite ${player.name}`,
            player,
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { 
            error: error.message, 
            details: null 
        });
    }
});

/**
 * Spieler aktualisieren (POST)
 */
router.post('/:id/edit', [
    isAuthenticated,
    csrfProtection
], async (req, res) => {
    try {
        const playerData = {
            name: req.body.name,
            team: req.body.team
        };

        await Player.update(req.params.id, playerData);
        res.redirect(`/player/${req.params.id}`);
    } catch (error) {
        console.error('Error updating player:', error);
        res.status(500).render('error', { error: error.message });
    }
});

/**
 * Spieler löschen
 */
router.post('/:id/delete', [
    isAuthenticated,
    csrfProtection
], async (req, res) => {
    try {
        await Player.delete(req.params.id);
        res.redirect('/player');
    } catch (error) {
        console.error('Error deleting player:', error);
        res.status(500).render('error', { error: error.message });
    }
});

module.exports = router; 