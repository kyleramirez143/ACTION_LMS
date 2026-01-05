module.exports = (sequelize, DataTypes) => {
    const AssessmentResponse = sequelize.define('AssessmentResponse', {
        response_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        assessment_id: { type: DataTypes.UUID, allowNull: false },
        user_id: { type: DataTypes.UUID, allowNull: false },
        question_id: { type: DataTypes.UUID, allowNull: false },
        answer: { type: DataTypes.JSON },
        score: { type: DataTypes.DECIMAL(5, 2) },
        feedback: { type: DataTypes.TEXT },
        submitted_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, {
        tableName: 'assessment_responses',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    AssessmentResponse.associate = (models) => {
        AssessmentResponse.belongsTo(models.Assessment, { foreignKey: 'assessment_id', as: 'assessment' });
        AssessmentResponse.belongsTo(models.AssessmentQuestion, { foreignKey: 'question_id', as: 'question' });
        AssessmentResponse.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    };

    return AssessmentResponse;
};
