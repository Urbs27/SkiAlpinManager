const { pool } = require('../config/database');

class Team {
    static SPECIALIZATIONS = {
        TECH: 'Technical',      // Fokus auf SL/GS
        SPEED: 'Speed',         // Fokus auf DH/SG
        ALL: 'All-Round',       // Ausgewogen
        COMBINED: 'Combined'    // Fokus auf Kombination
    };

    /**
     * Team nach ID abrufen
     */
    static async getById(id) {
        const result = await pool.query(
            'SELECT * FROM teams WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    /**
     * Team nach User ID abrufen
     */
    static async getByUserId(userId) {
        try {
            const result = await pool.query(
                'SELECT * FROM teams WHERE user_id = $1',
                [userId]
            );
            
            if (result.rows.length === 0) {
                return null;
            }
            
            return result.rows[0];
        } catch (error) {
            console.error('Error in getByUserId:', error);
            throw error;
        }
    }

    /**
     * Alle Teams abrufen
     */
    static async getAll() {
        const result = await pool.query('SELECT * FROM teams');
        return result.rows;
    }

    /**
     * Neues Team erstellen
     */
    static async create(teamData) {
        const result = await pool.query(
            `INSERT INTO teams (
                name, country, city, budget, reputation, 
                user_id, specialization, training_facilities,
                medical_staff, equipment_quality
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id`,
            [
                teamData.name,
                teamData.country,
                teamData.city,
                teamData.budget || 1000000,
                teamData.reputation || 50,
                teamData.user_id,
                teamData.specialization || 'ALL',
                teamData.training_facilities || 70,
                teamData.medical_staff || 70,
                teamData.equipment_quality || 70
            ]
        );
        return result.rows[0].id;
    }

    /**
     * Team aktualisieren
     */
    static async update(id, teamData) {
        await pool.query(
            `UPDATE teams 
             SET name = $1, country = $2, city = $3, budget = $4, reputation = $5
             WHERE id = $6`,
            [
                teamData.name,
                teamData.country,
                teamData.city,
                teamData.budget,
                teamData.reputation,
                id
            ]
        );
    }

    /**
     * Vollständige Team-Details abrufen
     */
    static async getFullDetails(id) {
        const team = await this.getById(id);
        if (!team) return null;

        const athletes = await pool.query(`
            SELECT 
                a.*,
                s.technik, s.kraft, s.ausdauer, s.mental,
                s.gleittechnik, s.kantentechnik, s.sprung_technik, s.form
            FROM athletes a
            LEFT JOIN athlete_stats s ON a.id = s.athlete_id
            WHERE a.team_id = $1
        `, [id]);

        return {
            ...team,
            athletes: athletes.rows
        };
    }

    /**
     * Budget aktualisieren
     */
    static async updateBudget(id, amount) {
        await pool.query(
            'UPDATE teams SET budget = budget + $1 WHERE id = $2',
            [amount, id]
        );
    }

    /**
     * Reputation aktualisieren
     */
    static async updateReputation(id, amount) {
        await pool.query(`
            UPDATE teams 
            SET reputation = CASE
                WHEN reputation + $1 > 100 THEN 100
                WHEN reputation + $1 < 0 THEN 0
                ELSE reputation + $1
            END
            WHERE id = $2`,
            [amount, id]
        );
    }

    /**
     * Anzahl der Teams abrufen
     */
    static async getCount() {
        const result = await pool.query('SELECT COUNT(*) as count FROM teams');
        return parseInt(result.rows[0].count);
    }

    /**
     * Gesamtanzahl der Athleten abrufen
     */
    static async getTotalAthletesCount() {
        const result = await pool.query('SELECT COUNT(*) as count FROM athletes');
        return parseInt(result.rows[0].count);
    }

    /**
     * Athleten eines Teams abrufen
     */
    static async getAthletes(teamId) {
        try {
            const result = await pool.query(`
                SELECT 
                    a.*,
                    s.technik, s.kraft, s.ausdauer, s.mental,
                    s.gleittechnik, s.kantentechnik, s.sprung_technik, s.form
                FROM athletes a
                LEFT JOIN athlete_stats s ON a.id = s.athlete_id
                WHERE a.team_id = $1
                ORDER BY a.overall_rating DESC
            `, [teamId]);
            
            return result.rows;
        } catch (error) {
            console.error('Error in getAthletes:', error);
            throw error;
        }
    }
}

module.exports = Team; 