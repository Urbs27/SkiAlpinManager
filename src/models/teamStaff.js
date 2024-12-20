const { dbAsync } = require('../config/database');

class TeamStaff {
    // Konstanten für Rollen
    static ROLES = {
        COACH: 'coach',
        PHYSIOTHERAPIST: 'physiotherapist',
        SKI_TECHNICIAN: 'ski_technician',
        ANALYST: 'analyst',
        DOCTOR: 'doctor',
        MANAGER: 'manager'
    };

    /**
     * Mitarbeiter nach ID abrufen
     */
    static async getById(id) {
        return await dbAsync.get(
            'SELECT * FROM team_staff WHERE id = ?',
            [id]
        );
    }

    /**
     * Alle Mitarbeiter eines Teams abrufen
     */
    static async getByTeamId(teamId) {
        return await dbAsync.all(
            `SELECT s.*, 
                    COUNT(DISTINCT a.id) as active_assignments
             FROM team_staff s
             LEFT JOIN staff_assignments a ON s.id = a.staff_id
             WHERE s.team_id = ?
             GROUP BY s.id
             ORDER BY s.role`,
            [teamId]
        );
    }

    /**
     * Mitarbeiter nach Rolle abrufen
     */
    static async getByRole(teamId, role) {
        return await dbAsync.get(
            `SELECT s.*, 
                    COUNT(DISTINCT a.id) as active_assignments
             FROM team_staff s
             LEFT JOIN staff_assignments a ON s.id = a.staff_id
             WHERE s.team_id = ? AND s.role = ?
             GROUP BY s.id`,
            [teamId, role]
        );
    }

    /**
     * Neuen Mitarbeiter einstellen
     */
    static async hire(staffData) {
        const result = await dbAsync.run(
            `INSERT INTO team_staff (
                team_id, role, name, quality, salary, contract_end,
                experience, specialization
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                staffData.team_id,
                staffData.role,
                staffData.name,
                staffData.quality,
                staffData.salary,
                staffData.contract_end,
                staffData.experience || 0,
                staffData.specialization || null
            ]
        );
        return result.lastID;
    }

    /**
     * Mitarbeiter entlassen
     */
    static async fire(id) {
        await dbAsync.run(
            'DELETE FROM team_staff WHERE id = ?',
            [id]
        );
    }

    /**
     * Vertrag verlängern
     */
    static async extendContract(id, newEndDate, newSalary) {
        await dbAsync.run(
            `UPDATE team_staff 
             SET contract_end = ?, salary = ?
             WHERE id = ?`,
            [newEndDate, newSalary, id]
        );
    }

    /**
     * Gehalt anpassen
     */
    static async updateSalary(id, newSalary) {
        await dbAsync.run(
            'UPDATE team_staff SET salary = ? WHERE id = ?',
            [newSalary, id]
        );
    }

    /**
     * Qualität verbessern
     */
    static async improveQuality(id, amount) {
        await dbAsync.run(
            `UPDATE team_staff 
             SET quality = CASE
                 WHEN quality + ? > 100 THEN 100
                 ELSE quality + ?
             END
             WHERE id = ?`,
            [amount, amount, id]
        );
    }

    /**
     * Erfahrung erhöhen
     */
    static async increaseExperience(id, amount) {
        await dbAsync.run(
            `UPDATE team_staff 
             SET experience = experience + ?
             WHERE id = ?`,
            [amount, id]
        );
    }
}

module.exports = TeamStaff; 