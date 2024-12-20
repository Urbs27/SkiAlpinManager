const Team = require('../../models/team');
const testDb = require('../../database/testDb');

describe('Team Model', () => {
  beforeEach(async () => {
    await testDb.clearTables();
  });

  test('sollte neues Team erstellen', async () => {
    const teamData = {
      name: 'Alpine Stars',
      country: 'Deutschland',
      budget: 1000000,
      reputation: 50
    };

    const team = await Team.create(teamData);
    expect(team.id).toBeDefined();
    expect(team.name).toBe(teamData.name);
  });

  test('sollte Budget aktualisieren', async () => {
    const team = await Team.create({
      name: 'Test Team',
      budget: 1000000
    });

    await Team.updateBudget(team.id, -100000);
    const updatedTeam = await Team.getById(team.id);
    expect(updatedTeam.budget).toBe(900000);
  });

  test('sollte Reputation-Grenzen einhalten', async () => {
    const team = await Team.create({
      name: 'Test Team',
      reputation: 50
    });

    await Team.updateReputation(team.id, 60);
    const maxTeam = await Team.getById(team.id);
    expect(maxTeam.reputation).toBe(100); // Max 100

    await Team.updateReputation(team.id, -150);
    const minTeam = await Team.getById(team.id);
    expect(minTeam.reputation).toBe(0); // Min 0
  });
}); 