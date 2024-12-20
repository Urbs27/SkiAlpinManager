class SponsorSystem {
    static SPONSOR_TIERS = {
        PLATINUM: {
            minRanking: 1,
            maxRanking: 10,
            baseValue: 1000000,
            bonusMultiplier: 2.0
        },
        GOLD: {
            minRanking: 11,
            maxRanking: 30,
            baseValue: 500000,
            bonusMultiplier: 1.5
        },
        SILVER: {
            minRanking: 31,
            maxRanking: 60,
            baseValue: 250000,
            bonusMultiplier: 1.2
        }
    };

    static calculateContractValue(athlete) {
        const baseTier = this.determineSponsortier(athlete.ranking);
        const baseValue = this.SPONSOR_TIERS[baseTier].baseValue;

        const modifiers = {
            popularity: athlete.popularity * 0.01,
            recentResults: this.calculateRecentResultsBonus(athlete),
            mediaPresence: athlete.mediaPresence * 0.005,
            nationality: this.getMarketValueForCountry(athlete.nationality)
        };

        return baseValue * Object.values(modifiers)
            .reduce((total, mod) => total * (1 + mod), 1);
    }

    static negotiateContract(athlete, sponsor) {
        // Verhandlungssystem
    }
} 