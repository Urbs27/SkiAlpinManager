const Race = require('../models/race');
const Player = require('../models/player');
const Weather = require('../models/weather');
const { calculateFISPoints } = require('../utils/fisPoints');
const { validateRaceConditions } = require('../utils/raceValidator');
const { broadcastLiveUpdate } = require('../utils/websocket');

class RaceController {
    /**
     * Rennen-Übersicht
     */
    static async index(req, res) {
        try {
            const races = await Race.getAll();
            const players = await Player.getByUserId(req.session.userId);
            
            res.render('race/index', {
                title: 'Rennen',
                races,
                players: players || [],
                csrfToken: req.csrfToken()
            });
        } catch (error) {
            console.error('Race index error:', error);
            res.status(500).render('error', { message: 'Serverfehler' });
        }
    }

    /**
     * Rennen-Details
     */
    static async details(req, res) {
        try {
            const race = await Race.getById(req.params.id);
            const participants = await Race.getParticipants(req.params.id);
            const weather = await Weather.getForRace(race.locationId);
            const courseData = await Race.getCourseData(req.params.id);

            res.render('race/details', {
                title: race.name,
                race,
                participants,
                weather,
                courseData,
                csrfToken: req.csrfToken()
            });
        } catch (error) {
            console.error('Race details error:', error);
            res.status(500).render('error', { message: 'Serverfehler' });
        }
    }

    /**
     * Rennanmeldung
     */
    static async register(req, res) {
        try {
            const { playerId } = req.body;
            const raceId = req.params.raceId;

            // Prüfe Anmeldebedingungen
            const player = await Player.getById(playerId);
            const race = await Race.getById(raceId);
            
            if (!player || !race) {
                throw new Error('Ungültige Anmeldedaten');
            }

            // Prüfe FIS-Punkte Limits
            if (race.fisPointsLimit && player.fisPoints > race.fisPointsLimit) {
                throw new Error('FIS-Punkte Limit überschritten');
            }

            await Race.registerPlayer(raceId, playerId);
            res.redirect(`/race/${raceId}`);
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).render('error', { message: error.message });
        }
    }

    /**
     * Live-Timing
     */
    static async liveTiming(req, res) {
        try {
            const race = await Race.getById(req.params.id);
            const startList = await Race.getStartList(req.params.id);
            const intermediates = await Race.getIntermediates(req.params.id);
            const weather = await Weather.getForRace(race.locationId);

            res.render('race/live', {
                title: 'Live-Timing',
                race,
                startList,
                intermediates,
                weather,
                csrfToken: req.csrfToken()
            });
        } catch (error) {
            console.error('Live timing error:', error);
            res.status(500).render('error', { message: 'Serverfehler' });
        }
    }

    /**
     * Rennstart (nur Rennleitung)
     */
    static async startRace(req, res) {
        try {
            const raceId = req.params.id;
            const race = await Race.getById(raceId);
            
            // Prüfe Wetterbedingungen
            const weather = await Weather.getForRace(race.locationId);
            const conditions = await validateRaceConditions(weather);
            
            if (!conditions.valid) {
                throw new Error(`Rennstart nicht möglich: ${conditions.reason}`);
            }

            await Race.start(raceId);
            broadcastLiveUpdate('race_started', { raceId });
            
            res.redirect(`/race/${raceId}/live`);
        } catch (error) {
            console.error('Race start error:', error);
            res.status(500).render('error', { message: error.message });
        }
    }

    /**
     * Zeitnahme
     */
    static async recordTime(req, res) {
        try {
            const { startNumber, time, type } = req.body;
            const raceId = req.params.id;

            const result = await Race.recordTime(raceId, startNumber, time, type);
            
            // Berechne und aktualisiere Ranking
            if (type === 'finish') {
                await Race.updateRankings(raceId);
            }

            // Sende Live-Update
            broadcastLiveUpdate('time_recorded', {
                raceId,
                startNumber,
                time,
                type,
                rank: result.rank
            });

            res.json({ success: true, result });
        } catch (error) {
            console.error('Time recording error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Disqualifikation
     */
    static async disqualify(req, res) {
        try {
            const { startNumber, reason, rule } = req.body;
            const raceId = req.params.id;

            await Race.disqualifyParticipant(raceId, startNumber, {
                reason,
                rule,
                officialId: req.user.id,
                timestamp: new Date()
            });

            // Aktualisiere Rangliste
            await Race.updateRankings(raceId);

            // Sende Live-Update
            broadcastLiveUpdate('disqualification', {
                raceId,
                startNumber,
                reason
            });

            res.redirect(`/race/${raceId}/results`);
        } catch (error) {
            console.error('Disqualification error:', error);
            res.status(500).render('error', { message: error.message });
        }
    }

    /**
     * Rennabbruch
     */
    static async cancelRace(req, res) {
        try {
            const { reason } = req.body;
            const raceId = req.params.id;

            await Race.cancel(raceId, {
                reason,
                officialId: req.user.id,
                timestamp: new Date()
            });

            // Sende Live-Update
            broadcastLiveUpdate('race_cancelled', {
                raceId,
                reason
            });

            res.redirect(`/race/${raceId}`);
        } catch (error) {
            console.error('Race cancellation error:', error);
            res.status(500).render('error', { message: error.message });
        }
    }

    /**
     * FIS-Punkte Berechnung
     */
    static async calculatePoints(req, res) {
        try {
            const raceId = req.params.id;
            const race = await Race.getById(raceId);
            const results = await Race.getResults(raceId);

            const points = await calculateFISPoints(race, results);
            await Race.updateFISPoints(raceId, points);

            res.redirect(`/race/${raceId}/results`);
        } catch (error) {
            console.error('FIS points calculation error:', error);
            res.status(500).render('error', { message: error.message });
        }
    }
}

module.exports = RaceController; 