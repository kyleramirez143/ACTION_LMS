module.exports = (sequelize, DataTypes) => {
  const AssessmentAttempt = sequelize.define("AssessmentAttempt", {
    attempt_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    assessment_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    attempt_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total_score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    max_score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    final_score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'in_progress',
    },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: "assessment_attempts",
    timestamps: false, 
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['assessment_id', 'user_id', 'attempt_number']
      }
    ]
  });

  AssessmentAttempt.associate = (models) => {
    AssessmentAttempt.belongsTo(models.Assessment, {
      foreignKey: "assessment_id",
      as: "assessment",
    });
    AssessmentAttempt.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
    AssessmentAttempt.hasMany(models.AssessmentResponse, {
      foreignKey: "attempt_id",
      as: "responses",
    });
  };

  return AssessmentAttempt;
};