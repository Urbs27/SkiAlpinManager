const express = require('express');
const router = express.Router();
const TeamStaffController = require('../controllers/teamStaffController');
const { isAuthenticated, isTeamManager } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');
const { validateStaffAction } = require('../middleware/validation');
const Team = require('../models/team');

/**
 * Middleware für Team-Zugriffsprüfung
 */
router.use('/:teamId/staff', [
    isAuthenticated,
    isTeamManager,
    async (req, res, next) => {
        try {
            const team = await Team.getById(req.params.teamId);
            if (!team || team.userId !== req.session.userId) {
                return res.status(403).render('error', {
                    title: 'Fehler',
                    message: 'Keine Berechtigung'
                });
            }
            req.team = team; // Team für spätere Verwendung speichern
            next();
        } catch (error) {
            next(error);
        }
    }
]);

/**
 * Personal-Übersicht
 */
router.get('/:teamId/staff', [
    csrfProtection
], TeamStaffController.showStaffOverview);

/**
 * Mitarbeiter einstellen
 */
router.get('/:teamId/staff/hire', [
    csrfProtection
], TeamStaffController.showHireForm);

router.post('/:teamId/staff/hire', [
    csrfProtection,
    validateStaffAction
], TeamStaffController.hireStaff);

/**
 * Mitarbeiter-Management
 */
router.post('/:teamId/staff/:staffId/fire', [
    csrfProtection,
    validateStaffAction
], TeamStaffController.fireStaff);

router.get('/:teamId/staff/:staffId/extend', [
    csrfProtection
], TeamStaffController.showExtendForm);

router.post('/:teamId/staff/:staffId/extend', [
    csrfProtection,
    validateStaffAction
], TeamStaffController.extendContract);

/**
 * Leistungsbewertung
 */
router.get('/:teamId/staff/:staffId/evaluate', [
    csrfProtection
], TeamStaffController.showEvaluationForm);

router.post('/:teamId/staff/:staffId/evaluate', [
    csrfProtection,
    validateStaffAction
], TeamStaffController.evaluatePerformance);

/**
 * Mitarbeiter-Details und Berichte
 */
router.get('/:teamId/staff/:staffId', [
    csrfProtection
], TeamStaffController.showStaffDetails);

router.get('/:teamId/staff/:staffId/history', [
    csrfProtection
], TeamStaffController.showStaffHistory);

router.get('/:teamId/staff/:staffId/report', [
    csrfProtection
], TeamStaffController.generateStaffReport);

/**
 * Gehaltsmanagement
 */
router.get('/:teamId/staff/salary-review', [
    csrfProtection
], TeamStaffController.showSalaryReview);

router.post('/:teamId/staff/:staffId/adjust-salary', [
    csrfProtection,
    validateStaffAction
], TeamStaffController.adjustSalary);

/**
 * API-Endpunkte
 */
router.get('/:teamId/staff/api/statistics', 
    TeamStaffController.getStaffStatistics
);

router.get('/:teamId/staff/api/contracts-expiring', 
    TeamStaffController.getExpiringContracts
);

/**
 * Export-Funktionen
 */
router.get('/:teamId/staff/export/roster', [
    csrfProtection
], TeamStaffController.exportStaffRoster);

router.get('/:teamId/staff/export/payroll', [
    csrfProtection
], TeamStaffController.exportPayrollReport);

/**
 * Fehlerbehandlung
 */
router.use((err, req, res, next) => {
    console.error('Staff route error:', err);
    res.status(500).render('error', {
        title: 'Fehler',
        message: 'Ein Fehler ist aufgetreten'
    });
});

module.exports = router; 