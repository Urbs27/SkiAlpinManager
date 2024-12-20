const TeamFacilities = require('../../models/teamFacilities');
const testDb = require('../../database/testDb');

describe('TeamFacilities Model', () => {
  beforeEach(async () => {
    await testDb.clearTables();
  });

  test('sollte neue Einrichtung erstellen', async () => {
    const facilityData = {
      team_id: 1,
      facility_type: TeamFacilities.FACILITY_TYPES.SKI_SERVICE,
      level: 1,
      condition: 100
    };

    const facility = await TeamFacilities.create(facilityData);
    expect(facility.id).toBeDefined();
    expect(facility.facility_type).toBe(facilityData.facility_type);
  });

  test('sollte Wartungskosten korrekt berechnen', async () => {
    const facility = await TeamFacilities.create({
      team_id: 1,
      facility_type: TeamFacilities.FACILITY_TYPES.SKI_SERVICE,
      level: 2
    });

    const cost = await TeamFacilities.getMaintenanceCost(facility.id);
    expect(cost).toBe(10000); // 5000 * level 2
  });

  test('sollte Upgrade-Kosten korrekt berechnen', async () => {
    const facility = await TeamFacilities.create({
      team_id: 1,
      facility_type: TeamFacilities.FACILITY_TYPES.TRAINING_SLOPE,
      level: 1
    });

    const cost = await TeamFacilities.getUpgradeCost(facility.id);
    expect(cost).toBeGreaterThan(0);
  });
}); 