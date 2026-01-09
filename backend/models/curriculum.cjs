const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Curriculum = sequelize.define('Curriculum', {
        curriculum_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        batch_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'batches',
                key: 'batch_id',
            }
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        start_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        end_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        }
    }, {
        tableName: 'curriculums',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true,
    });

    // ASSOCIATIONS
    Curriculum.associate = (models) => {
        // A Curriculum belongs to a Batch (Location, Batch Name etc)
        Curriculum.belongsTo(models.Batch, {
            foreignKey: 'batch_id',
            as: 'batch'
        });

        // A Curriculum has many Quarters (Module 1, 2, 3, 4)
        Curriculum.hasMany(models.Quarter, {
            foreignKey: 'curriculum_id',
            as: 'quarters',
            onDelete: 'CASCADE'
        });
    };

    return Curriculum;
};