const { dbAsync } = require('../config/database');

class Coach {
    static async create(coachData) {
        const result = await dbAsync.run(
            `INSERT INTO coaches (name, specialty, salary, team_id)
             VALUES (?, ?, ?, ?)`,
            [coachData.name, coachData.specialty, coachData.salary, coachData.team_id]
        );
        return result.lastID;
    }

    static async delete(id) {
        await dbAsync.run('DELETE FROM coaches WHERE id = ?', [id]);
    }
}

module.exports = Coach; 