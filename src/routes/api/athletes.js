const express = require('express');
const router = express.Router();
const { pool } = require('../../config/database');

// GET /api/athletes
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                a.*,
                t.name as team_name,
                json_build_object(
                    'technik', s.technik,
                    'kraft', s.kraft,
                    'ausdauer', s.ausdauer,
                    'mental', s.mental,
                    'gleittechnik', s.gleittechnik,
                    'kantentechnik', s.kantentechnik,
                    'sprung_technik', s.sprung_technik,
                    'form', s.form
                ) as stats
            FROM athletes a
            LEFT JOIN teams t ON a.team_id = t.id
            LEFT JOIN athlete_stats s ON a.id = s.athlete_id
            ORDER BY a.id
        `);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Fehler beim Abrufen der Athleten:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

// GET /api/athletes/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT 
                a.*,
                t.name as team_name,
                json_build_object(
                    'technik', s.technik,
                    'kraft', s.kraft,
                    'ausdauer', s.ausdauer,
                    'mental', s.mental,
                    'gleittechnik', s.gleittechnik,
                    'kantentechnik', s.kantentechnik,
                    'sprung_technik', s.sprung_technik,
                    'form', s.form
                ) as stats
            FROM athletes a
            LEFT JOIN teams t ON a.team_id = t.id
            LEFT JOIN athlete_stats s ON a.id = s.athlete_id
            WHERE a.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Athlet nicht gefunden' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Fehler beim Abrufen des Athleten:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

module.exports = router; 