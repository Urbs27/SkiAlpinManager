const TeamController = require('../../controllers/teamController');
const Team = require('../../models/team');
const db = require('../../database/testDb');

describe('TeamController', () => {
    let mockRequest;
    let mockResponse;

    beforeEach(() => {
        mockRequest = {
            session: { userId: 1 },
            body: {},
            params: {}
        };
        mockResponse = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            render: jest.fn()
        };
    });

    describe('getTeams', () => {
        test('sollte Teams für Benutzer abrufen', async () => {
            const mockTeams = [
                { id: 1, name: 'Team A', userId: 1 },
                { id: 2, name: 'Team B', userId: 1 }
            ];

            jest.spyOn(Team, 'findByUserId').mockResolvedValue(mockTeams);

            await TeamController.getTeams(mockRequest, mockResponse);

            expect(mockResponse.json).toHaveBeenCalledWith(mockTeams);
        });

        test('sollte Fehler behandeln', async () => {
            jest.spyOn(Team, 'findByUserId').mockRejectedValue(new Error('DB Fehler'));

            await TeamController.getTeams(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
        });
    });

    describe('createTeam', () => {
        test('sollte neues Team erstellen', async () => {
            const teamData = {
                name: 'Neues Team',
                country: 'Deutschland',
                budget: 1000000
            };
            mockRequest.body = teamData;

            const mockTeam = { id: 1, ...teamData, userId: 1 };
            jest.spyOn(Team, 'create').mockResolvedValue(mockTeam);

            await TeamController.createTeam(mockRequest, mockResponse);

            expect(Team.create).toHaveBeenCalledWith({
                ...teamData,
                userId: mockRequest.session.userId
            });
            expect(mockResponse.status).toHaveBeenCalledWith(201);
        });
    });
}); 