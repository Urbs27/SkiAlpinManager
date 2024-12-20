const { pool } = require('../config/database');

class Competition {
    static DISCIPLINES = {
        SL: { name: 'Slalom', technikFaktor: 0.4, kraftFaktor: 0.2, risikoFaktor: 0.2 },
        GS: { name: 'Riesenslalom', technikFaktor: 0.3, kraftFaktor: 0.3, risikoFaktor: 0.2 },
        SG: { name: 'Super-G', technikFaktor: 0.2, kraftFaktor: 0.4, risikoFaktor: 0.3 },
        DH: { name: 'Abfahrt', technikFaktor: 0.1, kraftFaktor: 0.5, risikoFaktor: 0.4 }
    };

    constructor(discipline, course, conditions) {
        this.discipline = discipline;
        this.course = course;
        this.conditions = conditions;
        this.participants = new Map();
        this.results = [];
        this.status = 'pending'; // pending, running, finished, cancelled
    }

    addParticipant(athlete) {
        this.participants.set(athlete.id, {
            athlete,
            startNumber: this.participants.size + 1,
            status: 'ready' // ready, dns, dnf, dsq
        });
    }

    async simulateRace() {
        if (this.status !== 'pending') return;
        
        this.status = 'running';
        const disciplineConfig = Competition.DISCIPLINES[this.discipline];

        // Sortiere Teilnehmer nach Startnummer
        const sortedParticipants = Array.from(this.participants.values())
            .sort((a, b) => a.startNumber - b.startNumber);

        for (const participant of sortedParticipants) {
            try {
                const result = await this.simulateRun(participant.athlete, disciplineConfig);
                this.results.push(result);
            } catch (error) {
                console.error(`Fehler bei Athlet ${participant.athlete.id}:`, error);
            }
        }

        this.status = 'finished';
        this.calculateFinalResults();
    }

    async simulateRun(athlete, disciplineConfig) {
        // Basis-Laufzeit basierend auf Streckenlänge und Schwierigkeit
        const baseTime = this.calculateBaseTime();

        // Berechne verschiedene Einflussfaktoren
        const factors = {
            technique: this.calculateTechniqueFactor(athlete, disciplineConfig),
            strength: this.calculateStrengthFactor(athlete, disciplineConfig),
            equipment: this.calculateEquipmentFactor(athlete),
            weather: this.calculateWeatherImpact(),
            mental: this.calculateMentalFactor(athlete),
            risk: this.calculateRiskFactor(athlete, disciplineConfig),
            fatigue: this.calculateFatigueFactor(athlete)
        };

        // Wende Faktoren auf Basis-Zeit an
        let finalTime = baseTime;
        Object.values(factors).forEach(factor => {
            finalTime *= factor;
        });

        // Füge realistische Mikrovariation hinzu (±0.5%)
        const microVariation = 0.995 + (Math.random() * 0.01);
        finalTime *= microVariation;

        // Prüfe auf DNF (Did Not Finish) basierend auf Risiko
        if (this.checkDNF(athlete, factors.risk)) {
            return {
                athleteId: athlete.id,
                status: 'dnf',
                factors
            };
        }

        return {
            athleteId: athlete.id,
            time: finalTime,
            factors,
            status: 'finished'
        };
    }

    // Hilfsmethoden für die Simulation
    calculateBaseTime() {
        return this.course.length * this.course.difficulty * 0.8;
    }

    calculateTechniqueFactor(athlete, config) {
        return 1 - (athlete.technique * config.technikFaktor / 100);
    }

    calculateStrengthFactor(athlete, config) {
        return 1 - (athlete.strength * config.kraftFaktor / 100);
    }

    calculateEquipmentFactor(athlete) {
        return 1 - (athlete.equipment.quality * 0.2 / 100);
    }

    calculateWeatherImpact() {
        const visibility = this.conditions.visibility / 100;
        const snowCondition = this.conditions.snowQuality / 100;
        const windEffect = Math.max(0, 1 - (this.conditions.windSpeed * 0.02));
        
        return (visibility + snowCondition + windEffect) / 3;
    }

    calculateMentalFactor(athlete) {
        return 1 - (athlete.mental * 0.15 / 100);
    }

    calculateRiskFactor(athlete, config) {
        const baseRisk = athlete.aggressiveness * config.risikoFaktor / 100;
        return 1 - (baseRisk * 0.2);
    }

    calculateFatigueFactor(athlete) {
        return 1 + (athlete.fatigue * 0.003);
    }

    checkDNF(athlete, riskFactor) {
        const dnfChance = 0.01 + (riskFactor * 0.05);
        return Math.random() < dnfChance;
    }

    calculateFinalResults() {
        // Sortiere Ergebnisse nach Zeit (DNFs ans Ende)
        this.results.sort((a, b) => {
            if (a.status === 'dnf' && b.status === 'dnf') return 0;
            if (a.status === 'dnf') return 1;
            if (b.status === 'dnf') return -1;
            return a.time - b.time;
        });

        // Berechne Weltcup-Punkte
        this.results.forEach((result, index) => {
            if (result.status === 'finished') {
                result.points = this.calculateWorldCupPoints(index + 1);
            }
        });
    }

    calculateWorldCupPoints(position) {
        const points = [100, 80, 60, 50, 45, 40, 36, 32, 29, 26, 24, 22, 20, 18, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
        return position <= points.length ? points[position - 1] : 0;
    }
}

module.exports = Competition; 