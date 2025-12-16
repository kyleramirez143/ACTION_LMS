module.exports = (sequelize, DataTypes) => {
    const LectureAssessment = sequelize.define('LectureAssessment', {
        lecture_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false
        },
        assessment_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'lecture_assessments',
        timestamps: false,
        underscored: true
    });

    LectureAssessment.associate = (models) => {
        LectureAssessment.belongsTo(models.Lecture, { foreignKey: 'lecture_id', as: 'lecture' });
        LectureAssessment.belongsTo(models.Assessment, { foreignKey: 'assessment_id', as: 'assessment' });
    };

    return LectureAssessment;
};
