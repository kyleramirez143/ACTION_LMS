module.exports = (sequelize, DataTypes) => {
    const Assessment = sequelize.define('Assessment', {
        assessment_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        pdf_source_url: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        assessment_type_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        is_published: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        created_by: {
            type: DataTypes.UUID,
            allowNull: false
        },
        // --- NEW QUIZ SETTINGS ---
        attempts: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: false
        },
        time_limit: {
            type: DataTypes.INTEGER,
            defaultValue: 30,
            allowNull: false
        },
        passing_score: {
            type: DataTypes.INTEGER,
            defaultValue: 70,
            allowNull: false,
        },
        due_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: true
        },
        screen_monitoring: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        },
        randomize_questions: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        },
        show_score: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        },
        show_explanations: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        },
        // --- timestamps ---
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'assessments',
        timestamps: false,
        underscored: true
    });

    Assessment.associate = (models) => {
        // Assessment belongs to User (creator)
        Assessment.belongsTo(models.User, {
            foreignKey: 'created_by',
            as: 'creator'
        });

        // Assessment can have many LectureAssessments
        Assessment.hasMany(models.LectureAssessment, {
            foreignKey: 'assessment_id',
            as: 'lectureAssessments'
        });

        Assessment.belongsToMany(models.Lecture, {
            through: 'lecture_assessments',
            foreignKey: 'assessment_id',
            otherKey: 'lecture_id',
            as: 'lectures',
        });

        Assessment.hasMany(models.AssessmentQuestion, {
            foreignKey: "assessment_id",
            as: "questions",
        });
    };

    return Assessment;
};
