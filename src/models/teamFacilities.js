const { dbAsync } = require('../config/database');

class TeamFacilities {
    // Konstanten für Einrichtungstypen
    static FACILITY_TYPES = {
        SKI_SERVICE: 'ski_service',      // Skiservice-Werkstatt
        TRAINING_SLOPE: 'training_slope', // Trainingshang
        GYM: 'gym',                      // Kraftraum
        MEDICAL: 'medical',              // Medizinische Einrichtung
        RECOVERY: 'recovery',            // Regenerationsbereich
        ANALYSIS: 'analysis',            // Videoanalyse-Zentrum
        LODGE: 'lodge'                   // Mannschaftsunterkunft
    };

    /**
     * Einrichtung nach ID abrufen
     */
    static async getById(id) {
        return await dbAsync.get(
            'SELECT * FROM team_facilities WHERE id = ?',
            [id]
        );
    }

    /**
     * Alle Einrichtungen eines Teams abrufen
     */
    static async getByTeamId(teamId) {
        return await dbAsync.all(
            `SELECT f.*, 
                    COUNT(DISTINCT u.id) as current_users,
                    MAX(m.maintenance_date) as last_maintenance
             FROM team_facilities f
             LEFT JOIN facility_usage u ON f.id = u.facility_id 
             LEFT JOIN facility_maintenance m ON f.id = m.facility_id
             WHERE f.team_id = ?
             GROUP BY f.id
             ORDER BY f.facility_type`,
            [teamId]
        );
    }

    /**
     * Spezifische Einrichtung eines Teams abrufen
     */
    static async getByType(teamId, facilityType) {
        return await dbAsync.get(
            `SELECT f.*, 
                    COUNT(DISTINCT u.id) as current_users,
                    MAX(m.maintenance_date) as last_maintenance
             FROM team_facilities f
             LEFT JOIN facility_usage u ON f.id = u.facility_id
             LEFT JOIN facility_maintenance m ON f.id = m.facility_id
             WHERE f.team_id = ? AND f.facility_type = ?
             GROUP BY f.id`,
            [teamId, facilityType]
        );
    }

    /**
     * Neue Einrichtung erstellen
     */
    static async create(facilityData) {
        const result = await dbAsync.run(
            `INSERT INTO team_facilities (
                team_id, facility_type, level, condition,
                capacity, efficiency, technology_level
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                facilityData.team_id,
                facilityData.facility_type,
                facilityData.level || 1,
                facilityData.condition || 100,
                this.getBaseCapacity(facilityData.facility_type),
                facilityData.efficiency || 100,
                facilityData.technology_level || 1
            ]
        );
        return result.lastID;
    }

    /**
     * Basis-Kapazität je nach Einrichtungstyp
     */
    static getBaseCapacity(facilityType) {
        const capacities = {
            [this.FACILITY_TYPES.SKI_SERVICE]: 10,    // Anzahl Ski gleichzeitig
            [this.FACILITY_TYPES.TRAINING_SLOPE]: 15, // Athleten gleichzeitig
            [this.FACILITY_TYPES.GYM]: 20,           // Athleten gleichzeitig
            [this.FACILITY_TYPES.MEDICAL]: 5,        // Behandlungsplätze
            [this.FACILITY_TYPES.RECOVERY]: 8,       // Regenerationsplätze
            [this.FACILITY_TYPES.ANALYSIS]: 12,      // Analyseplätze
            [this.FACILITY_TYPES.LODGE]: 25          // Betten
        };
        return capacities[facilityType] || 10;
    }

    /**
     * Einrichtung upgraden
     */
    static async upgrade(id) {
        const facility = await this.getById(id);
        const upgradeCost = await this.getUpgradeCost(id);
        
        await dbAsync.run(
            `UPDATE team_facilities 
             SET level = level + 1,
                 condition = 100,
                 capacity = capacity * 1.5,
                 efficiency = efficiency + 10,
                 technology_level = technology_level + 1
             WHERE id = ?`,
            [id]
        );

        // Wartungsprotokoll
        await dbAsync.run(
            `INSERT INTO facility_maintenance (
                facility_id, maintenance_type, cost, maintenance_date
            ) VALUES (?, 'upgrade', ?, CURRENT_TIMESTAMP)`,
            [id, upgradeCost]
        );
    }

    /**
     * Einrichtung warten
     */
    static async maintain(id) {
        const maintenanceCost = await this.getMaintenanceCost(id);
        
        await dbAsync.run(
            `UPDATE team_facilities 
             SET condition = 100,
                 efficiency = CASE 
                     WHEN efficiency < 100 THEN efficiency + 5 
                     ELSE efficiency 
                 END
             WHERE id = ?`,
            [id]
        );

        // Wartungsprotokoll
        await dbAsync.run(
            `INSERT INTO facility_maintenance (
                facility_id, maintenance_type, cost, maintenance_date
            ) VALUES (?, 'maintenance', ?, CURRENT_TIMESTAMP)`,
            [id, maintenanceCost]
        );
    }

    /**
     * Zustand verschlechtern
     */
    static async deteriorate(id, amount) {
        await dbAsync.run(
            `UPDATE team_facilities 
             SET condition = CASE
                     WHEN condition - ? < 0 THEN 0
                     ELSE condition - ?
                 END,
                 efficiency = CASE
                     WHEN condition - ? < 50 THEN efficiency - 2
                     WHEN efficiency > 100 THEN 100
                     ELSE efficiency
                 END
             WHERE id = ?`,
            [amount, amount, amount, id]
        );
    }

    /**
     * Prüfen ob Wartung notwendig
     */
    static async needsMaintenance(id) {
        const facility = await this.getById(id);
        return facility.condition < 50 || facility.efficiency < 80;
    }

    /**
     * Kosten für nächstes Upgrade berechnen
     */
    static async getUpgradeCost(id) {
        const facility = await this.getById(id);
        const baseCost = {
            [this.FACILITY_TYPES.SKI_SERVICE]: 200000,
            [this.FACILITY_TYPES.TRAINING_SLOPE]: 500000,
            [this.FACILITY_TYPES.GYM]: 150000,
            [this.FACILITY_TYPES.MEDICAL]: 300000,
            [this.FACILITY_TYPES.RECOVERY]: 200000,
            [this.FACILITY_TYPES.ANALYSIS]: 250000,
            [this.FACILITY_TYPES.LODGE]: 400000
        };
        return baseCost[facility.facility_type] * Math.pow(1.5, facility.level);
    }

    /**
     * Wartungskosten berechnen
     */
    static async getMaintenanceCost(id) {
        const facility = await this.getById(id);
        const baseCost = {
            [this.FACILITY_TYPES.SKI_SERVICE]: 5000,
            [this.FACILITY_TYPES.TRAINING_SLOPE]: 10000,
            [this.FACILITY_TYPES.GYM]: 3000,
            [this.FACILITY_TYPES.MEDICAL]: 7000,
            [this.FACILITY_TYPES.RECOVERY]: 4000,
            [this.FACILITY_TYPES.ANALYSIS]: 5000,
            [this.FACILITY_TYPES.LODGE]: 8000
        };
        return baseCost[facility.facility_type] * facility.level;
    }
}

module.exports = TeamFacilities; 