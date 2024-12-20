class InjurySystem {
    static INJURY_TYPES = {
        KNEE: {
            severity: [1, 5],
            baseRecoveryDays: 60,
            impactAreas: ['technique', 'confidence']
        },
        ANKLE: {
            severity: [1, 3],
            baseRecoveryDays: 30,
            impactAreas: ['agility', 'balance']
        },
        BACK: {
            severity: [1, 4],
            baseRecoveryDays: 45,
            impactAreas: ['strength', 'flexibility']
        }
    };

    static calculateInjuryRisk(athlete, conditions) {
        const baseRisk = 0.1; // 0.1% Grundrisiko
        
        const riskFactors = {
            fatigue: (athlete.fatigue / 100) * 0.5,
            courseCondition: (100 - conditions.courseQuality) / 100 * 0.3,
            equipment: (100 - athlete.equipment.condition) / 100 * 0.2,
            weather: this.calculateWeatherRiskFactor(conditions)
        };

        return baseRisk * Object.values(riskFactors)
            .reduce((total, factor) => total + factor, 1);
    }

    static handleInjury(athlete) {
        const injuryType = this.determineInjuryType();
        const severity = this.calculateSeverity(injuryType);
        
        return {
            type: injuryType,
            severity: severity,
            recoveryDays: this.calculateRecoveryTime(injuryType, severity),
            rehabilitationPlan: this.createRehabPlan(injuryType, severity),
            performanceImpact: this.calculatePerformanceImpact(injuryType, severity)
        };
    }
} 