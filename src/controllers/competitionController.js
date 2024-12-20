const Competition = require('../models/competition');
const Athlete = require('../models/athlete');
const Course = require('../models/course');
const Weather = require('../models/weather');

class CompetitionController {
    static async createCompetition(req, res) {
        try {
            const { discipline, courseId, date } = req.body;
            const course = await Course.getById(courseId);
            const conditions = await Weather.getByLocation(course.locationId);

            const competition = new Competition(discipline, course, conditions);
            await competition.save();

            res.status(201).json({ message: 'Wettkampf erfolgreich erstellt', competition });
        } catch (error) {
            console.error('Fehler beim Erstellen des Wettkampfs:', error);
            res.status(500).json({ error: 'Interner Serverfehler' });
        }
    }

    static async addAthlete(req, res) {
        try {
            const { competitionId, athleteId } = req.body;
            const competition = await Competition.getById(competitionId);
            const athlete = await Athlete.getById(athleteId);

            competition.addParticipant(athlete);
            await competition.save();

            res.status(200).json({ message: 'Athlet erfolgreich hinzugefügt', competition });
        } catch (error) {
            console.error('Fehler beim Hinzufügen des Athleten:', error);
            res.status(500).json({ error: 'Interner Serverfehler' });
        }
    }

    static async simulate(req, res) {
        try {
            const { competitionId } = req.params;
            const competition = await Competition.getById(competitionId);

            await competition.simulateRace();
            await competition.saveResults();

            res.status(200).json({ message: 'Wettkampf erfolgreich simuliert', results: competition.results });
        } catch (error) {
            console.error('Fehler bei der Simulation des Wettkampfs:', error);
            res.status(500).json({ error: 'Interner Serverfehler' });
        }
    }
}

module.exports = CompetitionController; 