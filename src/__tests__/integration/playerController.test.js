describe('Player Controller Integration', () => {
  beforeEach(async () => {
    await testDb.clearTables();
  });

  test('sollte Spieler mit Team-Beziehung erstellen', async () => {
    const teamData = {
      name: 'Test Team',
      country: 'Deutschland'
    };
    
    const team = await Team.create(teamData);
    
    const playerData = {
      firstName: 'Max',
      lastName: 'Mustermann',
      teamId: team.id,
      nationality: 'GER'
    };

    const mockReq = {
      body: playerData,
      session: { userId: 1 }
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await PlayerController.create(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(201);
  });
}); 