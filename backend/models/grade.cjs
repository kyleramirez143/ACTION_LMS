module.exports = (sequelize, DataTypes) => {
    const Grade = sequelize.define('Grade', {
        grade_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        user_id: { type: DataTypes.UUID, allowNull: false },
        assessment_id: { type: DataTypes.UUID, allowNull: false },
        grade_type: { type: DataTypes.STRING(50), defaultValue: 'quiz' },
        score: { type: DataTypes.DECIMAL(5, 2) },
        weight: { type: DataTypes.DECIMAL(5, 2), defaultValue: 70 },
        calculated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        remarks: { type: DataTypes.TEXT },
        overridden_by: { type: DataTypes.UUID, allowNull: true }
    }, {
        tableName: 'grades',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    Grade.associate = (models) => {
        Grade.belongsTo(models.Assessment, { foreignKey: 'assessment_id', as: 'assessment' });
        Grade.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    };

    return Grade;
};
