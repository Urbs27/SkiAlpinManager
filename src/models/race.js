const { db } = require('../config/database');

class Race {
    static async getAll() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM competitions 
                WHERE start_date > datetime('now')
                ORDER BY start_date ASC
            `;
            
            db.all(sql, [], (err, races) => {
                if (err) return reject(err);
                resolve(races || []);
            });
        });
    }

    static async getById(id) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM competitions
                WHERE id = ?
            `;
            
            db.get(sql, [id], (err, race) => {
                if (err) return reject(err);
                if (!race) return reject(new Error('Rennen nicht gefunden'));
                resolve(race);
            });
        });
    }

    static async registerPlayer(raceId, playerId) {
        return new Promise((resolve, reject) => {
            const checkSql = `
                SELECT * FROM competition_results 
                WHERE competition_id = ? AND player_id = ?
            `;
            
            db.get(checkSql, [raceId, playerId], (err, existing) => {
                if (err) return reject(err);
                if (existing) {
                    console.log('Spieler ist bereits angemeldet');
                    return resolve();
                }

                const sql = `
                    INSERT INTO competition_results (
                        competition_id, player_id, created_at
                    ) VALUES (?, ?, datetime('now'))
                `;
                
                db.run(sql, [raceId, playerId], (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
        });
    }

    static async simulateRace(raceId) {
        return new Promise(async (resolve, reject) => {
            try {
                const sql = `
                    SELECT cr.*, p.*, ps.*
                    FROM competition_results cr
                    JOIN players p ON cr.player_id = p.id
                    JOIN player_stats ps ON p.id = ps.player_id
                    WHERE cr.competition_id = ?
                `;

                db.all(sql, [raceId], async (err, participants) => {
                    if (err) return reject(err);

                    const results = participants.map(player => {
                        const baseTime = 100;
                        const skillFactor = (
                            (player.technik || 50) * 0.3 +
                            (player.kraft || 50) * 0.2 +
                            (player.form || 50) * 0.2 +
                            (player.gleittechnik || 50) * 0.15 +
                            (player.kurventechnik || 50) * 0.15
                        ) / 50;

                        const randomFactor = 0.95 + Math.random() * 0.1;
                        const finalTime = baseTime / skillFactor * randomFactor;

                        return {
                            player_id: player.player_id,
                            time: Math.round(finalTime * 100) / 100
                        };
                    });

                    results.sort((a, b) => a.time - b.time);
                    results.forEach((result, index) => {
                        result.rank = index + 1;
                        result.points = Math.max(100 - (index * 10), 0);
                    });

                    const updatePromises = results.map(result => {
                        return new Promise((resolve, reject) => {
                            const updateSql = `
                                UPDATE competition_results
                                SET time = ?, rank = ?, points = ?
                                WHERE competition_id = ? AND player_id = ?
                            `;
                            db.run(updateSql, 
                                [result.time, result.rank, result.points, raceId, result.player_id],
                                err => err ? reject(err) : resolve()
                            );
                        });
                    });

                    await Promise.all(updatePromises);
                    
                    const updateRaceSql = `
                        UPDATE competitions
                        SET status = 'finished'
                        WHERE id = ?
                    `;
                    db.run(updateRaceSql, [raceId], err => {
                        if (err) return reject(err);
                        resolve(results);
                    });
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    static async getResults(raceId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT cr.*, p.first_name || ' ' || p.last_name as player_name, t.name as team_name
                FROM competition_results cr
                JOIN players p ON cr.player_id = p.id
                JOIN teams t ON p.team_id = t.id
                WHERE cr.competition_id = ?
                ORDER BY cr.rank ASC
            `;
            
            db.all(sql, [raceId], (err, results) => {
                if (err) return reject(err);
                resolve(results || []);
            });
        });
    }
}

module.exports = Race; 