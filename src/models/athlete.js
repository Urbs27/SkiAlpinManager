const { pool } = require('../config/database');

class Athlete {
    // Konstanten für Athleten-Status
    static STATUS = {
        ACTIVE: 'active',
        INJURED: 'injured',
        RETIRED: 'retired',
        SUSPENDED: 'suspended'
    };

    // Disziplin-Gewichtungen für Gesamtbewertung
    static DISCIPLINE_WEIGHTS = {
        SLALOM: {
            technical: 0.5,    // Hoher Technik-Anteil
            physical: 0.2,     // Geringerer Kraft-Anteil
            mental: 0.2,       // Mentale Stärke wichtig
            specific: 0.1      // Spezifische Skills
        },
        GIANT_SLALOM: {
            technical: 0.4,
            physical: 0.3,
            mental: 0.15,
            specific: 0.15
        },
        SUPER_G: {
            technical: 0.3,
            physical: 0.4,
            mental: 0.15,
            specific: 0.15
        },
        DOWNHILL: {
            technical: 0.2,    // Geringerer Technik-Anteil
            physical: 0.4,     // Hoher Kraft-Anteil
            mental: 0.2,       // Mentale Stärke sehr wichtig
            specific: 0.2      // Spezifische Skills wichtiger
        }
    };

    /**
     * Berechnet das disziplinspezifische Rating eines Athleten
     */
    static calculateDisciplineRating(stats, discipline) {
        const weights = this.DISCIPLINE_WEIGHTS[discipline];
        if (!weights) throw new Error(`Ungültige Disziplin: ${discipline}`);

        // Technische Bewertung
        const technical = (
            stats.slalom_technik + 
            stats.riesenslalom_technik + 
            stats.super_g_technik + 
            stats.abfahrt_technik
        ) / 4;

        // Physische Bewertung
        const physical = (
            stats.kraft + 
            stats.explosivkraft + 
            stats.ausdauer + 
            stats.beweglichkeit
        ) / 4;

        // Mentale Bewertung
        const mental = (
            stats.mental_staerke + 
            stats.risikobereitschaft + 
            stats.stressresistenz + 
            stats.konzentration
        ) / 4;

        // Ski-spezifische Bewertung
        const specific = (
            stats.kantentechnik + 
            stats.gleittechnik + 
            stats.sprungtechnik + 
            stats.start_technik + 
            stats.ziel_sprint
        ) / 5;

        return Math.round(
            technical * weights.technical +
            physical * weights.physical +
            mental * weights.mental +
            specific * weights.specific
        );
    }

    /**
     * Aktualisiert die Form eines Athleten basierend auf Training und Erholung
     */
    static async updateForm(athleteId, trainingLoad, recovery) {
        const formChange = (trainingLoad * 0.6) + (recovery * 0.4);
        
        await pool.query(`
            UPDATE athlete_stats 
            SET form = GREATEST(70, LEAST(130, form + $1)),
                fitness = GREATEST(0, LEAST(100, fitness - $2)),
                ermuedung = GREATEST(0, LEAST(100, ermuedung + $3))
            WHERE athlete_id = $4
        `, [formChange, trainingLoad * 0.2, trainingLoad * 0.3, athleteId]);
    }

    /**
     * Simuliert eine Verletzung für einen Athleten
     */
    static async simulateInjury(athleteId, severity) {
        const recoveryTime = {
            light: '7 days',
            medium: '21 days',
            severe: '90 days'
        }[severity] || '14 days';

        await pool.query(`
            INSERT INTO athlete_injuries (
                athlete_id, injury_type, severity, 
                start_date, expected_return_date, status
            ) VALUES ($1, $2, $3, CURRENT_DATE, 
                     CURRENT_DATE + $4::interval, 'active')
        `, [athleteId, 'training_injury', severity, recoveryTime]);

        await pool.query(`
            UPDATE athletes 
            SET status = $1 
            WHERE id = $2
        `, [this.STATUS.INJURED, athleteId]);
    }

    /**
     * Athleten nach ID abrufen
     */
    static async getById(id) {
        const result = await pool.query(
            `SELECT 
                a.id, a.team_id, a.first_name, a.last_name, 
                a.nationality, a.license_id, a.birth_date,
                a.height, a.weight, a.experience_years,
                a.season_points, a.world_rank,
                a.overall_rating, a.potential_rating,
                a.contract_salary, a.contract_end, a.status,
                
                -- Technische Fähigkeiten
                as.slalom_technik, as.riesenslalom_technik,
                as.super_g_technik, as.abfahrt_technik,
                
                -- Physische Grundfähigkeiten
                as.kraft, as.explosivkraft, as.ausdauer, as.beweglichkeit,
                
                -- Mentale Fähigkeiten
                as.mental_staerke, as.risikobereitschaft,
                as.stressresistenz, as.konzentration,
                
                -- Ski-spezifische Fähigkeiten
                as.kantentechnik, as.gleittechnik, as.sprungtechnik,
                as.start_technik, as.ziel_sprint,
                
                -- Form und Fitness
                as.form, as.fitness, as.ermuedung,
                
                -- Disziplin-Ratings
                as.slalom_rating, as.riesenslalom_rating,
                as.super_g_rating, as.abfahrt_rating,
                
                -- Team Informationen
                t.name as team_name, t.country as team_country
                
            FROM athletes a
            LEFT JOIN athlete_stats as ON a.id = as.athlete_id
            LEFT JOIN teams t ON a.team_id = t.id
            WHERE a.id = $1`,
            [id]
        );
        
        const athlete = result.rows[0];
        if (athlete) {
            athlete.achievements = await this.getAchievements(id);
            athlete.injuries = await this.getInjuries(id);
        }
        
        return athlete;
    }

    /**
     * Alle Athleten eines Teams abrufen
     */
    static async getByTeamId(teamId) {
        const result = await pool.query(
            `SELECT 
                a.id, a.first_name, a.last_name, 
                a.nationality, a.overall_rating, a.potential_rating,
                a.status, a.world_rank,
                
                -- Disziplin-Ratings
                as.slalom_rating, as.riesenslalom_rating,
                as.super_g_rating, as.abfahrt_rating,
                
                -- Aktuelle Form
                as.form, as.fitness, as.ermuedung
                
            FROM athletes a
            LEFT JOIN athlete_stats as ON a.id = as.athlete_id
            WHERE a.team_id = $1
            ORDER BY a.overall_rating DESC`,
            [teamId]
        );
        
        return result.rows;
    }

    /**
     * Erfolge eines Athleten abrufen
     */
    static async getAchievements(athleteId) {
        const result = await pool.query(
            `SELECT 
                season, competition_type, discipline,
                position, race_points, season_points
            FROM athlete_achievements
            WHERE athlete_id = $1
            ORDER BY created_at DESC`,
            [athleteId]
        );
        return result.rows;
    }

    /**
     * Verletzungshistorie eines Athleten abrufen
     */
    static async getInjuries(athleteId) {
        const result = await pool.query(
            `SELECT 
                injury_type, severity, start_date,
                expected_return_date, actual_return_date, status
            FROM athlete_injuries
            WHERE athlete_id = $1
            ORDER BY start_date DESC`,
            [athleteId]
        );
        return result.rows;
    }

    /**
     * Berechnet das Overall-Rating basierend auf allen Stats
     */
    static calculateOverallRating(stats) {
        // Gewichtung der verschiedenen Kategorien
        const weights = {
            technical: 0.4,    // Technische Fähigkeiten
            physical: 0.25,    // Physische Grundfähigkeiten
            mental: 0.15,      // Mentale Fähigkeiten
            specific: 0.2      // Ski-spezifische Fähigkeiten
        };

        // Technische Bewertung
        const technical = (
            stats.slalom_technik + 
            stats.riesenslalom_technik + 
            stats.super_g_technik + 
            stats.abfahrt_technik
        ) / 4;

        // Physische Bewertung
        const physical = (
            stats.kraft + 
            stats.explosivkraft + 
            stats.ausdauer + 
            stats.beweglichkeit
        ) / 4;

        // Mentale Bewertung
        const mental = (
            stats.mental_staerke + 
            stats.risikobereitschaft + 
            stats.stressresistenz + 
            stats.konzentration
        ) / 4;

        // Ski-spezifische Bewertung
        const specific = (
            stats.kantentechnik + 
            stats.gleittechnik + 
            stats.sprungtechnik + 
            stats.start_technik + 
            stats.ziel_sprint
        ) / 5;

        // Gewichtete Summe
        return Math.round(
            technical * weights.technical +
            physical * weights.physical +
            mental * weights.mental +
            specific * weights.specific
        );
    }
}

module.exports = Athlete; 