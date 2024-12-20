const testDb = require('../database/testDb');

// Controller-Funktionen als Express-Handler formatieren
const getTeams = async (req, res) => {
  try {
    const teams = await new Promise((resolve, reject) => {
      testDb.db.all(
        'SELECT * FROM teams',
        (err, rows) => {
          if (err) reject(err);
          resolve(rows || []);
        }
      );
    });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teams' });
  }
};

const createTeam = async (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Team name is required' });
  }

  try {
    const teamId = await new Promise((resolve, reject) => {
      testDb.db.run(
        'INSERT INTO teams (name) VALUES (?)',
        [name],
        function(err) {
          if (err) reject(err);
          resolve(this.lastID);
        }
      );
    });
    res.status(201).json({ id: teamId, message: 'Team created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating team' });
  }
};

module.exports = {
  getTeams,
  createTeam
}; 