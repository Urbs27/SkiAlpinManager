require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  
  // Datenbank-Konfiguration
  database: {
    url: process.env.DATABASE_URL,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },

  // Authentifizierung & Sicherheit
  security: {
    bcryptRounds: 12,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiration: '24h'
  },

  // Ski-Alpin spezifische Konfigurationen
  ski: {
    // Verfügbare Disziplinen
    disciplines: {
      SL: {
        name: 'Slalom',
        minGates: 55,  // Herren
        maxLength: 75, // Meter zwischen Toren
        verticalDrop: {
          min: 180,    // Minimaler Höhenunterschied
          max: 220     // Maximaler Höhenunterschied
        }
      },
      GS: {
        name: 'Giant Slalom',
        minGates: 56,
        maxLength: 27,
        verticalDrop: {
          min: 300,
          max: 450
        }
      },
      SG: {
        name: 'Super-G',
        minGates: 35,
        verticalDrop: {
          min: 400,
          max: 650
        }
      },
      DH: {
        name: 'Downhill',
        minGates: 30,
        verticalDrop: {
          min: 800,
          max: 1100
        }
      }
    },

    // Weltcup-Punktesystem
    worldCupPoints: {
      1: 100,
      2: 80,
      3: 60,
      4: 50,
      5: 45,
      6: 40,
      7: 36,
      8: 32,
      9: 29,
      10: 26,
      11: 24,
      12: 22,
      13: 20,
      14: 18,
      15: 16,
      16: 15,
      17: 14,
      18: 13,
      19: 12,
      20: 11,
      21: 10,
      22: 9,
      23: 8,
      24: 7,
      25: 6,
      26: 5,
      27: 4,
      28: 3,
      29: 2,
      30: 1
    },

    // Saison-Konfiguration
    season: {
      startDate: '2024-10-22',  // Sölden
      endDate: '2025-03-17',    // Weltcup-Finale
      preSeasonStart: '2024-07-01',
      preSeasonEnd: '2024-10-21'
    },

    // Athleten-Limits
    athletes: {
      minAge: 16,
      maxAge: 45,
      retirementChance: {
        base: 0.05,        // 5% Grundchance
        ageMultiplier: 1.2 // Erhöht sich mit dem Alter
      }
    },

    // Verletzungsrisiken
    injuries: {
      baseRisk: 0.02,     // 2% Grundrisiko pro Rennen
      disciplines: {
        DH: 2.0,          // Doppeltes Risiko in Abfahrt
        SG: 1.5,
        GS: 1.2,
        SL: 1.0
      },
      conditions: {
        ice: 1.3,         // 30% höheres Risiko bei Eis
        soft: 1.1,
        perfect: 1.0
      }
    },

    // Equipment-Einfluss
    equipment: {
      maxCondition: 100,
      minCondition: 0,
      degradationRate: {
        training: 1,
        race: 2
      },
      performanceImpact: {
        perfect: 1.02,    // +2% Performance
        good: 1.0,
        worn: 0.98,
        poor: 0.95
      }
    },

    // Wetterbedingungen
    weather: {
      types: ['sunny', 'cloudy', 'snowing', 'foggy'],
      visibility: ['excellent', 'good', 'moderate', 'poor'],
      snowConditions: ['icy', 'hard', 'compact', 'soft', 'wet'],
      temperatureRange: {
        min: -25,
        max: 10
      }
    },

    // Trainingseffekte
    training: {
      maxIntensity: 10,
      recoveryRate: 0.1,  // 10% pro Tag
      improvementRate: {
        technique: 0.02,
        strength: 0.015,
        endurance: 0.01
      }
    }
  }
}; 