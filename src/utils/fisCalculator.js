/**
 * FIS-Punkterechner nach offizieller FIS-Formel
 * Quelle: https://assets.fis-ski.com/image/upload/v1593509148/fis-prod/assets/FIS_Points_Rules_2020.pdf
 */

const F_FACTORS = {
    'downhill': 1250,       // Abfahrt
    'super_g': 1190,       // Super-G
    'giant_slalom': 1010,  // Riesenslalom
    'slalom': 730          // Slalom
};

class FISCalculator {
    /**
     * Berechnet die Rennpunkte
     * @param {number} time - Laufzeit des Fahrers in Sekunden
     * @param {number} winnerTime - Siegerzeit in Sekunden
     * @param {string} discipline - Disziplin (downhill, super_g, giant_slalom, slalom)
     * @returns {number} - Rennpunkte
     */
    static calculateRacePoints(time, winnerTime, discipline) {
        if (!F_FACTORS[discipline]) {
            throw new Error('Ungültige Disziplin');
        }

        // Offizielle FIS-Formel: P = (Tz / Tx - 1) x F
        const points = ((time / winnerTime) - 1) * F_FACTORS[discipline];
        return Math.round(points * 100) / 100; // Auf 2 Dezimalstellen runden
    }

    /**
     * Berechnet die FIS-Punkte für ein Rennen
     * @param {number} racePoints - Rennpunkte
     * @param {number} racePenalty - Rennzuschlag
     * @returns {number} - FIS-Punkte
     */
    static calculateFISPoints(racePoints, racePenalty) {
        const points = racePoints + racePenalty;
        return Math.round(points * 100) / 100; // Auf 2 Dezimalstellen runden
    }

    /**
     * Berechnet den Rennzuschlag (Race Penalty)
     * @param {Array} topCompetitors - Array der 5 besten Starter (FIS-Punkte)
     * @param {Array} topFinishers - Array der 5 besten im Ziel (FIS-Punkte)
     * @returns {number} - Rennzuschlag
     */
    static calculateRacePenalty(topCompetitors, topFinishers) {
        // A = Summe der 5 besten FIS-Punkte am Start
        const sumA = topCompetitors
            .slice(0, 5)
            .reduce((sum, points) => sum + points, 0);

        // B = Summe der FIS-Punkte der 5 besten im Ziel
        const sumB = topFinishers
            .slice(0, 5)
            .reduce((sum, points) => sum + points, 0);

        // C = Summe der Rennpunkte der 5 besten im Ziel
        const sumC = topFinishers
            .slice(0, 5)
            .reduce((sum, result) => sum + result.racePoints, 0);

        // Formel: (A + B - C) / 10
        let penalty = (sumA + sumB - sumC) / 10;

        // Minimale Zuschläge nach Kategorie
        const minPenalty = {
            'WC': 0,      // Weltcup
            'EC': 6,      // Europacup
            'FIS': 15,    // FIS-Rennen
            'NC': 20      // National Championship
        };

        // Maximaler Zuschlag: 200 Punkte
        return Math.min(Math.max(penalty, minPenalty[category]), 200);
    }

    /**
     * Berechnet die Basis-Punkte für die Startliste
     * @param {Array} results - Array der letzten Ergebnisse
     * @returns {number} - Basis-Punkte
     */
    static calculateBasePoints(results) {
        if (results.length < 2) {
            return 999.99; // Maximalpunkte wenn keine Ergebnisse
        }

        // Durchschnitt der besten 2 Ergebnisse
        const sorted = results
            .map(r => r.fisPoints)
            .sort((a, b) => a - b);
        
        return Math.round(((sorted[0] + sorted[1]) / 2) * 100) / 100;
    }
}

module.exports = FISCalculator; 