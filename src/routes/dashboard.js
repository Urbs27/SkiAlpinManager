const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');
const { csrfProtection } = require('../middleware/csrf');

/**
 * Haupt-Dashboard
 */
router.get('/', [
    isAuthenticated,
    csrfProtection
], dashboardController.index);

/**
 * Team-Management
 */
router.get('/team', [
    isAuthenticated,
    csrfProtection
], dashboardController.teamOverview);

router.get('/team/athletes', [
    isAuthenticated,
    csrfProtection
], dashboardController.athletesList);

router.get('/team/statistics', [
    isAuthenticated,
    csrfProtection
], dashboardController.teamStatistics);

/**
 * Wettkampf-Management
 */
router.get('/competitions', [
    isAuthenticated,
    csrfProtection
], dashboardController.competitionsList);

router.get('/competitions/upcoming', [
    isAuthenticated,
    csrfProtection
], dashboardController.upcomingCompetitions);

router.get('/competitions/results', [
    isAuthenticated,
    csrfProtection
], dashboardController.competitionResults);

/**
 * Training und Entwicklung
 */
router.get('/training', [
    isAuthenticated,
    csrfProtection
], dashboardController.trainingOverview);

router.get('/training/schedule', [
    isAuthenticated,
    csrfProtection
], dashboardController.trainingSchedule);

router.get('/training/analysis', [
    isAuthenticated,
    csrfProtection
], dashboardController.performanceAnalysis);

/**
 * FIS-Punkte und Rankings
 */
router.get('/rankings', [
    isAuthenticated,
    csrfProtection
], dashboardController.rankingsOverview);

router.get('/rankings/fis-points', [
    isAuthenticated,
    csrfProtection
], dashboardController.fisPointsHistory);

/**
 * Benachrichtigungen
 */
router.get('/notifications', [
    isAuthenticated,
    csrfProtection
], dashboardController.notifications);

router.post('/notifications/mark-read', [
    isAuthenticated,
    csrfProtection
], dashboardController.markNotificationsRead);

/**
 * Einstellungen
 */
router.get('/settings', [
    isAuthenticated,
    csrfProtection
], dashboardController.settings);

router.post('/settings/update', [
    isAuthenticated,
    csrfProtection
], dashboardController.updateSettings);

/**
 * API-Endpunkte für Dashboard-Widgets
 */
router.get('/api/team-summary', 
    isAuthenticated,
    dashboardController.getTeamSummary
);

router.get('/api/recent-results', 
    isAuthenticated,
    dashboardController.getRecentResults
);

router.get('/api/upcoming-events', 
    isAuthenticated,
    dashboardController.getUpcomingEvents
);

router.get('/api/performance-stats', 
    isAuthenticated,
    dashboardController.getPerformanceStats
);

/**
 * Export-Funktionen
 */
router.get('/export/team-report', [
    isAuthenticated,
    csrfProtection
], dashboardController.exportTeamReport);

router.get('/export/season-statistics', [
    isAuthenticated,
    csrfProtection
], dashboardController.exportSeasonStatistics);

module.exports = router; 