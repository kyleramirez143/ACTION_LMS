const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Quarter = sequelize.define('Quarter', {
        quarter_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        curriculum_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'curriculums', key: 'curriculum_id' } // Added 's'
        },
        name: {
            type: DataTypes.STRING(100),
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
        tableName: 'quarters',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true,
    });

    // This is what your index.cjs calls
    Quarter.associate = (models) => {
        Quarter.belongsTo(models.Curriculum, {
            foreignKey: 'curriculum_id',
            as: 'curriculum' // Matches the 'as' used in your controller
        });
    };

    return Quarter;
};