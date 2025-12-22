module.exports = (sequelize, DataTypes) => {
    const AssessmentQuestion = sequelize.define("AssessmentQuestion", {
        question_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        assessment_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        question_text: { type: DataTypes.TEXT, allowNull: false },
        explanations: { type: DataTypes.TEXT, allowNull: true },
        options: { type: DataTypes.JSON },
        correct_answer: { type: DataTypes.JSON },
        points: { type: DataTypes.INTEGER, defaultValue: 1 },
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        section: { type: DataTypes.STRING(50), allowNull: true }
    }, {
        tableName: "assessment_questions",
        timestamps: false,
        underscored: true,
    });

    AssessmentQuestion.associate = (models) => {
        AssessmentQuestion.belongsTo(models.Assessment, {
            foreignKey: "assessment_id",
            as: "assessment",
        });
    };

    return AssessmentQuestion;
};
