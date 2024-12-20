/**
 * Offizielle FIS Weltcup-Punkteverteilung
 * Quelle: https://www.fis-ski.com/en/inside-fis/document-library/alpine-documents
 */

const WORLD_CUP_POINTS = {
    1: 100,
    2: 80,
    3: 60,
    4: 50,
    5: 45,
    6: 40,
    7: 36,
    8: 32,
    9: 29,
    10: 26,
    11: 24,
    12: 22,
    13: 20,
    14: 18,
    15: 16,
    16: 15,
    17: 14,
    18: 13,
    19: 12,
    20: 11,
    21: 10,
    22: 9,
    23: 8,
    24: 7,
    25: 6,
    26: 5,
    27: 4,
    28: 3,
    29: 2,
    30: 1
};

const EUROPA_CUP_POINTS = {
    1: 100,
    2: 80,
    3: 60,
    4: 50,
    5: 45,
    6: 40,
    7: 36,
    8: 32,
    9: 29,
    10: 26,
    11: 24,
    12: 22,
    13: 20,
    14: 18,
    15: 16,
    16: 15,
    17: 14,
    18: 13,
    19: 12,
    20: 11,
    21: 10,
    22: 9,
    23: 8,
    24: 7,
    25: 6,
    26: 5,
    27: 4,
    28: 3,
    29: 2,
    30: 1
};

class WorldCupCalculator {
    /**
     * Berechnet die Weltcup/Europacup-Punkte basierend auf der Position
     * @param {number} position - Erreichte Position
     * @param {string} category - Wettkampf-Kategorie (WC, EC)
     * @returns {number} - Punkte für die Position
     */
    static calculatePoints(position, category) {
        const pointsTable = category === 'WC' ? WORLD_CUP_POINTS : EUROPA_CUP_POINTS;
        return pointsTable[position] || 0;
    }

    /**
     * Berechnet die Disziplinenwertung
     * @param {Array} results - Array von Ergebnissen
     * @returns {number} - Gesamtpunkte
     */
    static calculateDisciplinePoints(results) {
        // Beste Ergebnisse zählen (je nach Anzahl der Rennen)
        const sortedResults = results
            .filter(r => !r.dnf && !r.dsq) // Nur gültige Ergebnisse
            .sort((a, b) => b.points - a.points);

        // Summe der Punkte
        return sortedResults.reduce((sum, result) => sum + result.points, 0);
    }

    /**
     * Berechnet die Gesamtwertung
     * @param {Object} disciplinePoints - Objekt mit Punkten pro Disziplin
     * @returns {number} - Gesamtpunkte
     */
    static calculateOverallPoints(disciplinePoints) {
        return Object.values(disciplinePoints)
            .reduce((sum, points) => sum + points, 0);
    }

    /**
     * Prüft Qualifikation für Weltcup-Finale
     * @param {number} disciplineRank - Aktuelle Position in der Disziplinenwertung
     * @param {number} overallRank - Aktuelle Position in der Gesamtwertung
     * @returns {boolean} - Qualifikationsstatus
     */
    static isQualifiedForFinals(disciplineRank, overallRank) {
        // Top 25 der Disziplin oder Top 25 Gesamt sind qualifiziert
        return disciplineRank <= 25 || overallRank <= 25;
    }

    /**
     * Berechnet Nationencup-Punkte
     * @param {Array} results - Array von Ergebnissen
     * @param {string} gender - 'M' oder 'F'
     * @returns {Object} - Punkte pro Nation
     */
    static calculateNationsCupPoints(results, gender) {
        const nationPoints = {};

        results.forEach(result => {
            if (result.points > 0) {
                const nation = result.player.team;
                if (!nationPoints[nation]) {
                    nationPoints[nation] = 0;
                }
                // Damen-Punkte werden mit Faktor 1 gewertet, Herren mit Faktor 2
                nationPoints[nation] += result.points * (gender === 'F' ? 1 : 2);
            }
        });

        return nationPoints;
    }
}

module.exports = WorldCupCalculator; 