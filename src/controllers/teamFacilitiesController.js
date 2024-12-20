const TeamFacilities = require('../models/teamFacilities');
const Team = require('../models/team');

class TeamFacilitiesController {
    /**
     * Einrichtungen-Übersicht anzeigen
     */
    static async showFacilitiesOverview(req, res) {
        try {
            const teamId = req.params.teamId;
            const facilities = await TeamFacilities.getByTeamId(teamId);
            const team = await Team.getById(teamId);

            // Berechne Upgrade-Kosten für jede Einrichtung
            const facilitiesWithCosts = await Promise.all(
                facilities.map(async (facility) => ({
                    ...facility,
                    upgradeCost: await TeamFacilities.getUpgradeCost(facility.id),
                    needsMaintenance: await TeamFacilities.needsMaintenance(facility.id)
                }))
            );

            res.render('team/facilities/overview', {
                title: 'Einrichtungen',
                team,
                facilities: facilitiesWithCosts
            });
        } catch (error) {
            console.error('Fehler beim Laden der Einrichtungen:', error);
            res.render('error', {
                title: 'Fehler',
                error: 'Fehler beim Laden der Einrichtungen'
            });
        }
    }

    /**
     * Einrichtung upgraden
     */
    static async upgradeFacility(req, res) {
        try {
            const { teamId, facilityId } = req.params;
            const team = await Team.getById(teamId);
            const upgradeCost = await TeamFacilities.getUpgradeCost(facilityId);

            // Prüfe ob genug Budget vorhanden
            if (team.budget < upgradeCost) {
                return res.status(400).json({
                    error: 'Nicht genügend Budget für das Upgrade'
                });
            }

            // Führe Upgrade durch
            await TeamFacilities.upgrade(facilityId);
            await Team.updateBudget(teamId, -upgradeCost);

            // Erhöhe Team-Reputation
            await Team.updateReputation(teamId, 2);

            res.redirect(`/team/${teamId}/facilities`);
        } catch (error) {
            console.error('Fehler beim Upgrade:', error);
            res.status(500).json({
                error: 'Fehler beim Upgrade der Einrichtung'
            });
        }
    }

    /**
     * Einrichtung warten
     */
    static async maintainFacility(req, res) {
        try {
            const { teamId, facilityId } = req.params;
            const maintenanceCost = 10000; // Beispiel: Fixe Wartungskosten

            const team = await Team.getById(teamId);
            if (team.budget < maintenanceCost) {
                return res.status(400).json({
                    error: 'Nicht genügend Budget für die Wartung'
                });
            }

            await TeamFacilities.maintain(facilityId);
            await Team.updateBudget(teamId, -maintenanceCost);

            res.redirect(`/team/${teamId}/facilities`);
        } catch (error) {
            console.error('Fehler bei der Wartung:', error);
            res.status(500).json({
                error: 'Fehler bei der Wartung der Einrichtung'
            });
        }
    }

    /**
     * Neue Einrichtung bauen
     */
    static async buildFacility(req, res) {
        try {
            const teamId = req.params.teamId;
            const { facilityType } = req.body;
            const buildCost = 100000; // Beispiel: Fixe Baukosten

            const team = await Team.getById(teamId);
            if (team.budget < buildCost) {
                return res.status(400).json({
                    error: 'Nicht genügend Budget für den Bau'
                });
            }

            await TeamFacilities.create({
                team_id: teamId,
                facility_type: facilityType
            });
            await Team.updateBudget(teamId, -buildCost);
            await Team.updateReputation(teamId, 5);

            res.redirect(`/team/${teamId}/facilities`);
        } catch (error) {
            console.error('Fehler beim Bau:', error);
            res.status(500).json({
                error: 'Fehler beim Bau der Einrichtung'
            });
        }
    }
}

module.exports = TeamFacilitiesController; 