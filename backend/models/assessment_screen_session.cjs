module.exports = (sequelize, DataTypes) => {
    const AssessmentScreenSession = sequelize.define('AssessmentScreenSession', {
        session_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        assessment_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'assessments',
                key: 'assessment_id'
            }
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        start_time: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        },
        end_time: {
            type: DataTypes.DATE,
            allowNull: true
        },
        recording_url: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        status: {
            type: DataTypes.STRING(20),
            defaultValue: 'active',
            allowNull: false
        }
    }, {
        tableName: 'assessment_screen_sessions',
        // In Sequelize CJS, 'underscored: true' helps map camelCase to snake_case
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    AssessmentScreenSession.associate = (models) => {
        // Session belongs to an Assessment
        AssessmentScreenSession.belongsTo(models.Assessment, {
            foreignKey: 'assessment_id',
            as: 'assessment'
        });

        // Session belongs to a User
        AssessmentScreenSession.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });
    };

    return AssessmentScreenSession;
};