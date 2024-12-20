const { dbAsync } = require('../config/database');

class Track {
    // Konstanten für Disziplinen
    static DISCIPLINES = {
        DH: 'downhill',
        SG: 'super_g',
        GS: 'giant_slalom',
        SL: 'slalom'
    };

    /**
     * Alle Strecken abrufen
     */
    static async getAll() {
        const tracks = await dbAsync.all(`
            SELECT t.*, 
                   COUNT(DISTINCT r.id) as race_count,
                   AVG(r.snow_condition) as avg_snow_condition
            FROM tracks t
            LEFT JOIN races r ON t.id = r.track_id
            GROUP BY t.id
            ORDER BY t.discipline, t.difficulty ASC
        `);
        
        tracks.forEach(track => {
            track.training_bonus = JSON.parse(track.training_bonus);
            track.section_data = JSON.parse(track.section_data);
            track.weather_impact = JSON.parse(track.weather_impact);
        });
        
        return tracks;
    }

    /**
     * Strecke nach ID abrufen
     */
    static async getById(id) {
        const track = await dbAsync.get(`
            SELECT t.*, 
                   COUNT(DISTINCT r.id) as race_count,
                   AVG(r.snow_condition) as avg_snow_condition
            FROM tracks t
            LEFT JOIN races r ON t.id = r.track_id
            WHERE t.id = ?
            GROUP BY t.id
        `, [id]);
        
        if (!track) throw new Error('Strecke nicht gefunden');
        
        track.training_bonus = JSON.parse(track.training_bonus);
        track.section_data = JSON.parse(track.section_data);
        track.weather_impact = JSON.parse(track.weather_impact);
        
        return track;
    }

    /**
     * Trainingszeit berechnen
     */
    static calculateTrainingTime(track, player) {
        // Basis-Trainingszeit (Sekunden pro 100 Höhenmeter)
        const baseTime = track.vertical_drop / 100 * this.getBaseDisciplineTime(track.discipline);

        // Spieler-Attribute für die Disziplin
        const attributes = this.getDisciplineAttributes(track.discipline, player);
        
        // Geschwindigkeitsmodifikator basierend auf Attributen
        const speedModifier = Object.values(attributes).reduce((sum, val) => sum + val, 0) 
                            / (Object.keys(attributes).length * 100);

        // Schwierigkeitsmodifikator
        const difficultyModifier = 1 + ((track.difficulty - 1) * 0.2);

        // Gesamtzeit berechnen
        const totalTime = Math.round(baseTime * difficultyModifier * (2 - speedModifier));

        return Math.min(Math.max(totalTime, track.min_time), track.max_time);
    }

    /**
     * Basis-Zeit je nach Disziplin
     */
    static getBaseDisciplineTime(discipline) {
        const times = {
            [this.DISCIPLINES.DH]: 30,  // 30s pro 100hm
            [this.DISCIPLINES.SG]: 35,  // 35s pro 100hm
            [this.DISCIPLINES.GS]: 45,  // 45s pro 100hm
            [this.DISCIPLINES.SL]: 55   // 55s pro 100hm
        };
        return times[discipline] || 45;
    }

    /**
     * Relevante Attribute je nach Disziplin
     */
    static getDisciplineAttributes(discipline, player) {
        const attributes = {
            [this.DISCIPLINES.DH]: {
                gleittechnik: player.gleittechnik || 50,
                kraft: player.kraft || 50,
                mental: player.mental || 50
            },
            [this.DISCIPLINES.SG]: {
                gleittechnik: player.gleittechnik || 50,
                kantentechnik: player.kantentechnik || 50,
                kraft: player.kraft || 50
            },
            [this.DISCIPLINES.GS]: {
                kantentechnik: player.kantentechnik || 50,
                technik: player.technik || 50,
                kraft: player.kraft || 50
            },
            [this.DISCIPLINES.SL]: {
                kantentechnik: player.kantentechnik || 50,
                technik: player.technik || 50,
                mental: player.mental || 50
            }
        };
        return attributes[discipline] || attributes[this.DISCIPLINES.GS];
    }

    /**
     * Trainingsergebnisse berechnen
     */
    static calculateTrainingResults(track, player, trainingTime) {
        const results = {
            attributes: {},
            experience: 0,
            fatigue: 0,
            injury_risk: 0,
            injury: false
        };

        // Attributverbesserungen basierend auf Streckenbonus
        Object.entries(track.training_bonus).forEach(([attr, bonus]) => {
            const baseImprovement = Math.random() * bonus;
            const qualityModifier = player.form ? (player.form / 100) : 0.5;
            results.attributes[attr] = Math.round(baseImprovement * qualityModifier * 10) / 10;
        });

        // Erfahrung basierend auf Schwierigkeit und Zeit
        results.experience = Math.round(
            trainingTime * track.difficulty * 
            (1 + (player.mental ? player.mental / 200 : 0.25))
        );

        // Ermüdung berechnen
        const fatigueResistance = (
            (player.ausdauer || 50) + 
            (player.kraft || 50)
        ) / 200;
        
        results.fatigue = Math.round(
            trainingTime * (1 - fatigueResistance) * 
            (track.difficulty / 2)
        );

        // Verletzungsrisiko berechnen
        results.injury_risk = this.calculateInjuryRisk(track, player, results.fatigue);
        results.injury = Math.random() < results.injury_risk;

        return results;
    }

    /**
     * Verletzungsrisiko berechnen
     */
    static calculateInjuryRisk(track, player, fatigue) {
        const baseRisk = 0.05;
        const difficultyRisk = track.difficulty * 0.02;
        const fatigueRisk = fatigue * 0.001;
        const equipmentBonus = (player.gleittechnik || 50) * 0.001;
        const fitnessBonus = (player.fitness || 100) * 0.001;

        return Math.max(0, Math.min(1,
            baseRisk + difficultyRisk + fatigueRisk - equipmentBonus - fitnessBonus
        ));
    }
}

module.exports = Track; 