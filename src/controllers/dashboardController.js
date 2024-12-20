const User = require('../models/user');
const Team = require('../models/team');
const Player = require('../models/player');
const Competition = require('../models/competition');
const Training = require('../models/training');
const Notification = require('../models/notification');
const { generatePDF } = require('../utils/pdfGenerator');
const { calculateTeamStats } = require('../utils/statistics');

class DashboardController {
    /**
     * Dashboard Hauptseite
     */
    static async index(req, res) {
        try {
            const user = await User.getById(req.session.userId);
            const team = await Team.getByUserId(user.id);
            const recentResults = await Competition.getRecentResults(team.id, 5);
            const upcomingEvents = await Competition.getUpcoming(team.id, 5);
            const notifications = await Notification.getUnread(user.id);

            res.render('dashboard/index', {
                title: 'Dashboard',
                user,
                team,
                recentResults,
                upcomingEvents,
                notifications,
                csrfToken: req.csrfToken()
            });
        } catch (error) {
            console.error('Dashboard error:', error);
            res.status(500).render('error', { message: 'Serverfehler' });
        }
    }

    /**
     * Team-Übersicht
     */
    static async teamOverview(req, res) {
        try {
            const team = await Team.getByUserId(req.session.userId);
            const athletes = await Player.getByTeam(team.id);
            const stats = await calculateTeamStats(team.id);

            res.render('dashboard/team', {
                title: 'Team-Übersicht',
                team,
                athletes,
                stats,
                csrfToken: req.csrfToken()
            });
        } catch (error) {
            console.error('Team overview error:', error);
            res.status(500).render('error', { message: 'Serverfehler' });
        }
    }

    /**
     * Wettkampf-Liste
     */
    static async competitionsList(req, res) {
        try {
            const team = await Team.getByUserId(req.session.userId);
            const competitions = await Competition.getAllForTeam(team.id);
            const registrations = await Competition.getRegistrations(team.id);

            res.render('dashboard/competitions', {
                title: 'Wettkämpfe',
                competitions,
                registrations,
                csrfToken: req.csrfToken()
            });
        } catch (error) {
            console.error('Competitions list error:', error);
            res.status(500).render('error', { message: 'Serverfehler' });
        }
    }

    /**
     * Training-Übersicht
     */
    static async trainingOverview(req, res) {
        try {
            const team = await Team.getByUserId(req.session.userId);
            const trainingSessions = await Training.getByTeam(team.id);
            const performanceData = await Training.getPerformanceData(team.id);

            res.render('dashboard/training', {
                title: 'Training',
                trainingSessions,
                performanceData,
                csrfToken: req.csrfToken()
            });
        } catch (error) {
            console.error('Training overview error:', error);
            res.status(500).render('error', { message: 'Serverfehler' });
        }
    }

    /**
     * FIS-Punkte Historie
     */
    static async fisPointsHistory(req, res) {
        try {
            const team = await Team.getByUserId(req.session.userId);
            const athletes = await Player.getByTeam(team.id);
            const pointsHistory = await Promise.all(
                athletes.map(async (athlete) => ({
                    athlete,
                    history: await Player.getFISPointsHistory(athlete.id)
                }))
            );

            res.render('dashboard/fis-points', {
                title: 'FIS-Punkte Historie',
                pointsHistory,
                csrfToken: req.csrfToken()
            });
        } catch (error) {
            console.error('FIS points history error:', error);
            res.status(500).render('error', { message: 'Serverfehler' });
        }
    }

    /**
     * Benachrichtigungen
     */
    static async notifications(req, res) {
        try {
            const notifications = await Notification.getForUser(req.session.userId);
            
            res.render('dashboard/notifications', {
                title: 'Benachrichtigungen',
                notifications,
                csrfToken: req.csrfToken()
            });
        } catch (error) {
            console.error('Notifications error:', error);
            res.status(500).render('error', { message: 'Serverfehler' });
        }
    }

    /**
     * API Endpunkte für Dashboard-Widgets
     */
    static async getTeamSummary(req, res) {
        try {
            const team = await Team.getByUserId(req.session.userId);
            const summary = await Team.getSummary(team.id);
            res.json(summary);
        } catch (error) {
            console.error('Team summary error:', error);
            res.status(500).json({ error: 'Serverfehler' });
        }
    }

    static async getPerformanceStats(req, res) {
        try {
            const team = await Team.getByUserId(req.session.userId);
            const stats = await calculateTeamStats(team.id);
            res.json(stats);
        } catch (error) {
            console.error('Performance stats error:', error);
            res.status(500).json({ error: 'Serverfehler' });
        }
    }

    /**
     * Export-Funktionen
     */
    static async exportTeamReport(req, res) {
        try {
            const team = await Team.getByUserId(req.session.userId);
            const reportData = await Team.generateReport(team.id);
            const pdf = await generatePDF('team-report', reportData);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=team-report.pdf`);
            res.send(pdf);
        } catch (error) {
            console.error('Team report export error:', error);
            res.status(500).render('error', { message: 'Export fehlgeschlagen' });
        }
    }

    static async exportSeasonStatistics(req, res) {
        try {
            const team = await Team.getByUserId(req.session.userId);
            const seasonData = await Team.getSeasonStatistics(team.id);
            const pdf = await generatePDF('season-statistics', seasonData);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=season-statistics.pdf`);
            res.send(pdf);
        } catch (error) {
            console.error('Season statistics export error:', error);
            res.status(500).render('error', { message: 'Export fehlgeschlagen' });
        }
    }
}

module.exports = DashboardController; 