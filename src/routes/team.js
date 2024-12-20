const express = require('express');
const router = express.Router();
const Team = require('../models/team');

// GET /team/all - Alle Teams abrufen (MUSS ZUERST kommen!)
router.get('/all', async (req, res) => {
    try {
        const teams = await Team.getAll();
        res.json(teams);
    } catch (error) {
        console.error('Fehler beim Abrufen aller Teams:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

// GET /team/user/:userId
router.get('/user/:userId', async (req, res) => {
    try {
        const team = await Team.getByUserId(req.params.userId);
        if (!team) {
            return res.status(404).json({ error: 'Team nicht gefunden' });
        }
        res.json(team);
    } catch (error) {
        console.error('Fehler beim Abrufen des Teams:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

// GET /team/:id
router.get('/:id', async (req, res) => {
    try {
        const team = await Team.getFullDetails(req.params.id);
        if (!team) {
            return res.status(404).json({ error: 'Team nicht gefunden' });
        }
        res.json(team);
    } catch (error) {
        console.error('Fehler beim Abrufen des Teams:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

// GET /team/:id/athletes
router.get('/:id/athletes', async (req, res) => {
    try {
        const athletes = await Team.getAthletes(req.params.id);
        res.json(athletes);
    } catch (error) {
        console.error('Error in /team/:id/athletes:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

// POST /team - Neues Team erstellen
router.post('/', async (req, res) => {
    try {
        const teamId = await Team.create(req.body);
        res.status(201).json({ id: teamId, message: 'Team erfolgreich erstellt' });
    } catch (error) {
        console.error('Fehler beim Erstellen des Teams:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

// PUT /team/:id - Team-Details aktualisieren
router.put('/:id', async (req, res) => {
    try {
        await Team.update(req.params.id, req.body);
        res.json({ message: 'Team erfolgreich aktualisiert' });
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Teams:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

// PUT /team/:id/budget - Budget aktualisieren
router.put('/:id/budget', async (req, res) => {
    try {
        const { amount } = req.body;
        await Team.updateBudget(req.params.id, amount);
        res.json({ message: 'Budget erfolgreich aktualisiert' });
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Budgets:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

// PUT /team/:id/reputation - Reputation aktualisieren
router.put('/:id/reputation', async (req, res) => {
    try {
        const { amount } = req.body;
        await Team.updateReputation(req.params.id, amount);
        res.json({ message: 'Reputation erfolgreich aktualisiert' });
    } catch (error) {
        console.error('Fehler beim Aktualisieren der Reputation:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

module.exports = router;