const Player = require('../../models/player');
const db = require('../../database/testDb');

describe('Player Model', () => {
    beforeEach(async () => {
        await db.query('DELETE FROM players');
    });

    test('sollte neuen Spieler erstellen', async () => {
        const playerData = {
            firstName: 'Max',
            lastName: 'Mustermann',
            nationality: 'GER',
            birthDate: '1995-01-01',
            teamId: 1
        };

        const player = await Player.create(playerData);

        expect(player.id).toBeDefined();
        expect(player.firstName).toBe(playerData.firstName);
        expect(player.lastName).toBe(playerData.lastName);
    });

    test('sollte Spielerstatistiken aktualisieren', async () => {
        const player = await Player.create({
            firstName: 'Max',
            lastName: 'Mustermann',
            teamId: 1
        });

        const stats = await player.updateStats({
            slalomSkill: 75,
            giantSlalomSkill: 80,
            downhillSkill: 70
        });

        expect(stats.slalomSkill).toBe(75);
        expect(stats.giantSlalomSkill).toBe(80);
    });

    test('sollte Spielerverletzungen verwalten', async () => {
        const player = await Player.create({
            firstName: 'Max',
            lastName: 'Mustermann',
            teamId: 1
        });

        const injury = await player.addInjury({
            type: 'Knieverletzung',
            severity: 'mittel',
            recoveryTime: 14
        });

        expect(injury.id).toBeDefined();
        expect(injury.type).toBe('Knieverletzung');
        expect(player.isInjured()).toBe(true);
    });
}); 