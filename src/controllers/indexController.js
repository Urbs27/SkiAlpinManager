const Competition = require('../models/competition');
const News = require('../models/news');
const Weather = require('../models/weather');
const User = require('../models/user');
const Team = require('../models/team');

class IndexController {
    /**
     * Homepage
     */
    static async home(req, res) {
        try {
            let user = null;
            if (req.session.userId) {
                user = await User.getById(req.session.userId);
            }
            
            const currentCompetitions = await Competition.getUpcoming();
            const latestNews = await News.getLatest(5);

            // Statistiken abrufen
            const totalTeams = await Team.getCount();
            const totalCompetitions = await Competition.getCount();
            const activeCompetitions = await Competition.getActiveCount();
            const totalPlayers = await Team.getTotalPlayersCount();

            const stats = {
                totalTeams,
                totalCompetitions,
                activeCompetitions,
                totalPlayers
            };

            res.render('index', {
                title: 'Ski Alpin Manager',
                user,
                currentCompetitions,
                latestNews,
                stats
            });
        } catch (error) {
            console.error('Home error:', error);
            res.status(500).render('errors/500', {
                title: 'Serverfehler',
                error: process.env.NODE_ENV === 'development' ? error : {}
            });
        }
    }

    /**
     * Über uns
     */
    static async about(req, res) {
        try {
            const user = req.session.userId ? await User.getById(req.session.userId) : null;
            res.render('about', {
                title: 'Über uns',
                user
            });
        } catch (error) {
            console.error('About error:', error);
            res.status(500).render('errors/500', {
                title: 'Serverfehler',
                error: process.env.NODE_ENV === 'development' ? error : {}
            });
        }
    }

    /**
     * Neuigkeiten
     */
    static async news(req, res) {
        try {
            const news = await News.getAll();
            res.render('news', {
                title: 'Neuigkeiten',
                news,
                user: req.session.userId ? await User.getById(req.session.userId) : null
            });
        } catch (error) {
            console.error('News error:', error);
            res.status(500).render('error', { message: 'Serverfehler' });
        }
    }

    /**
     * Wettkampfkalender
     */
    static async calendar(req, res) {
        try {
            const competitions = await Competition.getAll();
            res.render('calendar', {
                title: 'Wettkampfkalender',
                competitions,
                user: req.session.userId ? await User.getById(req.session.userId) : null
            });
        } catch (error) {
            console.error('Calendar error:', error);
            res.status(500).render('error', { message: 'Serverfehler' });
        }
    }

    /**
     * Live-Ergebnisse
     */
    static async liveResults(req, res) {
        try {
            const liveCompetitions = await Competition.getLive();
            res.render('live-results', {
                title: 'Live-Ergebnisse',
                liveCompetitions,
                user: req.session.userId ? await User.getById(req.session.userId) : null
            });
        } catch (error) {
            console.error('Live results error:', error);
            res.status(500).render('error', { message: 'Serverfehler' });
        }
    }

    /**
     * Benutzer-Dashboard
     */
    static async dashboard(req, res) {
        try {
            const user = await User.getById(req.session.userId);
            res.render('dashboard', {
                title: 'Benutzer-Dashboard',
                user
            });
        } catch (error) {
            console.error('Dashboard error:', error);
            res.status(500).render('error', { message: 'Serverfehler' });
        }
    }

    /**
     * Team-Bereich
     */
    static async team(req, res) {
        try {
            const user = await User.getById(req.session.userId);
            const team = await Team.getByUserId(user.id);
            res.render('team', {
                title: 'Team-Bereich',
                user,
                team
            });
        } catch (error) {
            console.error('Team error:', error);
            res.status(500).render('error', { message: 'Serverfehler' });
        }
    }

    /**
     * API Endpunkte
     */
    static async getCurrentCompetitions(req, res) {
        try {
            const competitions = await Competition.getCurrent();
            res.json(competitions);
        } catch (error) {
            console.error('Current competitions error:', error);
            res.status(500).json({ error: 'Serverfehler' });
        }
    }

    static async getLiveUpdates(req, res) {
        try {
            const { competitionId } = req.params;
            const updates = await Competition.getLiveUpdates(competitionId);
            res.json(updates);
        } catch (error) {
            console.error('Live updates error:', error);
            res.status(500).json({ error: 'Serverfehler' });
        }
    }

    static async getWeatherConditions(req, res) {
        try {
            const { locationId } = req.params;
            const weather = await Weather.getByLocation(locationId);
            res.json(weather);
        } catch (error) {
            console.error('Weather conditions error:', error);
            res.status(500).json({ error: 'Serverfehler' });
        }
    }

    static async index(req, res) {
        try {
            const stats = {
                totalTeams: 0, // Beispielwerte
                totalCompetitions: 0,
                activeCompetitions: 0,
                totalPlayers: 0
            };
            const currentCompetitions = []; // Beispielwerte
            const latestNews = []; // Beispielwerte

            res.render('index', {
                title: 'Startseite',
                currentPage: 'home',
                user: req.session.user,
                stats,
                currentCompetitions,
                latestNews
            });
        } catch (error) {
            console.error('Fehler beim Laden der Startseite:', error);
            res.status(500).render('errors/500', {
                title: 'Serverfehler',
                error: process.env.NODE_ENV === 'development' ? error : {}
            });
        }
    }
}

module.exports = IndexController; 