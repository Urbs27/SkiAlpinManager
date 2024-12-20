const TeamStaff = require('../models/teamStaff');
const Team = require('../models/team');
const { calculateSalary } = require('../utils/salaryCalculator');
const { validateStaffContract } = require('../utils/validation');
const { createAuditLog } = require('../utils/auditLogger');

class TeamStaffController {
    /**
     * Mitarbeiter-Übersicht anzeigen
     */
    static async showStaffOverview(req, res) {
        try {
            const teamId = req.params.teamId;
            const staff = await TeamStaff.getByTeamId(teamId);
            const team = await Team.getById(teamId);
            const openPositions = await TeamStaff.getOpenPositions(teamId);

            // Gruppiere Mitarbeiter nach Rollen
            const staffByRole = staff.reduce((acc, member) => {
                if (!acc[member.role]) acc[member.role] = [];
                acc[member.role].push({
                    ...member,
                    contractStatus: TeamStaff.getContractStatus(member),
                    performance: TeamStaff.calculatePerformance(member)
                });
                return acc;
            }, {});

            res.render('team/staff/overview', {
                title: 'Personal-Übersicht',
                team,
                staffByRole,
                openPositions,
                csrfToken: req.csrfToken()
            });
        } catch (error) {
            console.error('Fehler beim Laden der Personal-Übersicht:', error);
            res.status(500).render('error', { message: 'Serverfehler' });
        }
    }

    /**
     * Mitarbeiter einstellen
     */
    static async hireStaff(req, res) {
        try {
            const teamId = req.params.teamId;
            const team = await Team.getById(teamId);
            const {
                role,
                name,
                experience,
                qualifications,
                contractLength
            } = req.body;

            // Berechne Gehalt basierend auf Qualifikationen
            const salary = calculateSalary(role, experience, qualifications);

            // Validiere Vertrag
            const validationResult = validateStaffContract({
                role,
                salary,
                contractLength,
                teamBudget: team.budget
            });

            if (!validationResult.isValid) {
                return res.status(400).json({
                    error: validationResult.errors.join(', ')
                });
            }

            // Stelle neuen Mitarbeiter ein
            const staffMember = await TeamStaff.hire({
                teamId,
                role,
                name,
                experience,
                qualifications,
                salary,
                contractEnd: new Date(Date.now() + contractLength * 31536000000) // Jahre in MS
            });

            // Erstelle Audit-Log
            await createAuditLog({
                type: 'STAFF_HIRED',
                teamId,
                userId: req.session.userId,
                details: {
                    staffId: staffMember.id,
                    role,
                    salary
                }
            });

            res.redirect(`/team/${teamId}/staff`);
        } catch (error) {
            console.error('Fehler beim Einstellen:', error);
            res.status(500).render('error', { message: error.message });
        }
    }

    /**
     * Mitarbeiter entlassen
     */
    static async fireStaff(req, res) {
        try {
            const { teamId, staffId } = req.params;
            const { reason } = req.body;
            const staff = await TeamStaff.getById(staffId);

            // Berechne Abfindung
            const severancePay = await TeamStaff.calculateSeverance(staff);
            
            // Prüfe Budget
            const team = await Team.getById(teamId);
            if (team.budget < severancePay) {
                return res.status(400).json({
                    error: 'Nicht genügend Budget für die Abfindung'
                });
            }

            await TeamStaff.fire(staffId, reason);
            await Team.updateBudget(teamId, -severancePay);

            // Erstelle Audit-Log
            await createAuditLog({
                type: 'STAFF_FIRED',
                teamId,
                userId: req.session.userId,
                details: {
                    staffId,
                    reason,
                    severancePay
                }
            });

            res.redirect(`/team/${teamId}/staff`);
        } catch (error) {
            console.error('Fehler beim Entlassen:', error);
            res.status(500).render('error', { message: error.message });
        }
    }

    /**
     * Vertrag verlängern
     */
    static async extendContract(req, res) {
        try {
            const { teamId, staffId } = req.params;
            const { newSalary, newEndDate, performance } = req.body;

            // Validiere neue Vertragsbedingungen
            const staff = await TeamStaff.getById(staffId);
            const validationResult = validateStaffContract({
                role: staff.role,
                salary: newSalary,
                contractLength: (new Date(newEndDate) - new Date()) / 31536000000,
                performance
            });

            if (!validationResult.isValid) {
                return res.status(400).json({
                    error: validationResult.errors.join(', ')
                });
            }

            await TeamStaff.extendContract(staffId, newEndDate, newSalary);
            
            // Erstelle Audit-Log
            await createAuditLog({
                type: 'CONTRACT_EXTENDED',
                teamId,
                userId: req.session.userId,
                details: {
                    staffId,
                    newSalary,
                    newEndDate
                }
            });

            res.redirect(`/team/${teamId}/staff`);
        } catch (error) {
            console.error('Fehler bei Vertragsverlängerung:', error);
            res.status(500).render('error', { message: error.message });
        }
    }

    /**
     * Leistungsbewertung
     */
    static async evaluatePerformance(req, res) {
        try {
            const { teamId, staffId } = req.params;
            const { rating, comments } = req.body;

            await TeamStaff.updatePerformance(staffId, {
                rating,
                comments,
                evaluatedBy: req.session.userId,
                evaluatedAt: new Date()
            });

            res.redirect(`/team/${teamId}/staff/${staffId}`);
        } catch (error) {
            console.error('Fehler bei Leistungsbewertung:', error);
            res.status(500).render('error', { message: error.message });
        }
    }
}

module.exports = TeamStaffController; 