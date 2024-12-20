const awilix = require('awilix');
const container = awilix.createContainer();

// Services und Repositories registrieren
container.register({
  // Core Services
  logger: awilix.asFunction(require('./logger')).singleton(),
  db: awilix.asFunction(require('./database')).singleton(),
  
  // Ski-spezifische Services
  raceService: awilix.asClass(require('../services/raceService')).scoped(),
  athleteService: awilix.asClass(require('../services/athleteService')).scoped(),
  teamService: awilix.asClass(require('../services/teamService')).scoped(),
  weatherService: awilix.asClass(require('../services/weatherService')).singleton(),
  statisticsService: awilix.asClass(require('../services/statisticsService')).scoped(),
  equipmentService: awilix.asClass(require('../services/equipmentService')).scoped(),
  trainingService: awilix.asClass(require('../services/trainingService')).scoped(),
  
  // Repositories
  raceRepository: awilix.asClass(require('../repositories/raceRepository')).scoped(),
  athleteRepository: awilix.asClass(require('../repositories/athleteRepository')).scoped(),
  teamRepository: awilix.asClass(require('../repositories/teamRepository')).scoped(),
  resultRepository: awilix.asClass(require('../repositories/resultRepository')).scoped(),
  
  // Utilities
  timeCalculator: awilix.asClass(require('../utils/timeCalculator')).singleton(),
  pointsCalculator: awilix.asClass(require('../utils/pointsCalculator')).singleton(),
  weatherSimulator: awilix.asClass(require('../utils/weatherSimulator')).singleton(),
});

module.exports = container; 