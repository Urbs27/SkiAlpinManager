const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Document = sequelize.define('Document', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    type: {
        type: DataTypes.ENUM,
        values: ['Vertrag', 'Lizenz', 'Versicherung', 'Sonstiges'],
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM,
        values: ['Aktiv', 'Abgelaufen', 'Gekündigt'],
        defaultValue: 'Aktiv'
    },
    validFrom: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    validUntil: {
        type: DataTypes.DATE,
        allowNull: true
    },
    teamId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Teams',
            key: 'id'
        }
    },
    relatedEntityType: {
        type: DataTypes.STRING,
        allowNull: true // z.B. 'Coach', 'Athlete'
    },
    relatedEntityId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'documents',
    timestamps: true,
    hooks: {
        beforeCreate: (doc) => {
            if (!doc.validUntil && doc.type === 'Vertrag') {
                // Standardlaufzeit für Verträge: 1 Jahr
                const oneYearFromNow = new Date();
                oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
                doc.validUntil = oneYearFromNow;
            }
        }
    }
});

// Instanz-Methoden
Document.prototype.isValid = function() {
    const now = new Date();
    return this.status === 'Aktiv' && 
           (!this.validUntil || this.validUntil > now);
};

Document.prototype.terminate = async function() {
    this.status = 'Gekündigt';
    this.validUntil = new Date();
    return await this.save();
};

// Klassen-Methoden
Document.createContract = async function(teamId, entityType, entityId, details) {
    return await Document.create({
        type: 'Vertrag',
        title: `${entityType}-Vertrag`,
        content: JSON.stringify(details),
        teamId,
        relatedEntityType: entityType,
        relatedEntityId: entityId,
        status: 'Aktiv'
    });
};

// Füge die Beziehungen zum index.js Model hinzu
Document.associate = (models) => {
    Document.belongsTo(models.Team, {
        foreignKey: 'teamId',
        as: 'team'
    });
};

module.exports = Document; 