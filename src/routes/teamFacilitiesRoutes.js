const express = require('express');
const router = express.Router();
const TeamFacilitiesController = require('../controllers/teamFacilitiesController');
const { isAuthenticated, isTeamManager } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');
const { validateFacilityAction } = require('../middleware/validation');
const Team = require('../models/team');

/**
 * Middleware für Team-Zugriffsprüfung
 */
router.use('/:teamId/facilities', [
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
 * Einrichtungen-Übersicht
 */
router.get('/:teamId/facilities', [
    csrfProtection
], TeamFacilitiesController.showFacilitiesOverview);

/**
 * Neue Einrichtung
 */
router.get('/:teamId/facilities/build', [
    csrfProtection
], TeamFacilitiesController.showBuildForm);

router.post('/:teamId/facilities/build', [
    csrfProtection,
    validateFacilityAction
], TeamFacilitiesController.buildFacility);

/**
 * Einrichtungs-Management
 */
router.post('/:teamId/facilities/:facilityId/upgrade', [
    csrfProtection,
    validateFacilityAction
], TeamFacilitiesController.upgradeFacility);

router.post('/:teamId/facilities/:facilityId/maintain', [
    csrfProtection,
    validateFacilityAction
], TeamFacilitiesController.maintainFacility);

/**
 * Einrichtungs-Details
 */
router.get('/:teamId/facilities/:facilityId', [
    csrfProtection
], TeamFacilitiesController.showFacilityDetails);

/**
 * Einrichtungs-Statistiken
 */
router.get('/:teamId/facilities/statistics', [
    csrfProtection
], TeamFacilitiesController.showStatistics);

/**
 * Einrichtungs-Planung
 */
router.get('/:teamId/facilities/planning', [
    csrfProtection
], TeamFacilitiesController.showPlanning);

router.post('/:teamId/facilities/planning/save', [
    csrfProtection,
    validateFacilityAction
], TeamFacilitiesController.savePlanning);

/**
 * Einrichtungs-Reports
 */
router.get('/:teamId/facilities/reports', [
    csrfProtection
], TeamFacilitiesController.showReports);

router.get('/:teamId/facilities/reports/export', [
    csrfProtection
], TeamFacilitiesController.exportReport);

/**
 * API-Endpunkte
 */
router.get('/:teamId/facilities/api/status', 
    TeamFacilitiesController.getStatus
);

router.get('/:teamId/facilities/api/maintenance-schedule', 
    TeamFacilitiesController.getMaintenanceSchedule
);

/**
 * Fehlerbehandlung
 */
router.use((err, req, res, next) => {
    console.error('Facilities route error:', err);
    res.status(500).render('error', {
        title: 'Fehler',
        message: 'Ein Fehler ist aufgetreten'
    });
});

module.exports = router; 