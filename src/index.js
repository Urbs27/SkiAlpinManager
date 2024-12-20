const { initDatabase } = require('./config/database');
const Player = require('./models/player');
const Track = require('./models/track');
const Race = require('./models/race');

// Datenbank initialisieren
initDatabase();

// Beispiel-Funktion zum Erstellen eines neuen Rennens
async function createNewRace() {
    try {
        // Beispiel-Strecke erstellen
        const trackId = await Track.create({
            name: "Kitzbühel - Streif",
            discipline: "downhill",
            difficulty: 90,
            length: 3312,
            altitude_diff: 862
        });

        // Beispiel-Spieler erstellen
        const player1Id = await Player.create({
            name: "Max Mustermann",
            team: "Austria"
        });

        const player2Id = await Player.create({
            name: "Hans Schmidt",
            team: "Germany"
        });

        // Spieler und Strecke laden
        const track = await Track.getById(trackId);
        const player1 = await Player.getById(player1Id);
        const player2 = await Player.getById(player2Id);

        // Rennzeiten berechnen und speichern
        const time1 = Race.calculateRaceTime(player1, track);
        const time2 = Race.calculateRaceTime(player2, track);

        await Race.createResult(player1Id, trackId, time1);
        await Race.createResult(player2Id, trackId, time2);

        // Ergebnisse anzeigen
        const results = await Race.getResults(trackId);
        console.log("\nRennergebnisse:");
        console.log("==============");
        results.forEach((result, index) => {
            console.log(`${index + 1}. ${result.player_name}: ${result.time} Sekunden`);
        });

    } catch (error) {
        console.error('Fehler:', error);
    }
}

// Beispielrennen ausführen
createNewRace(); 