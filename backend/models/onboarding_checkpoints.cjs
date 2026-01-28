'use strict';

module.exports = (sequelize, DataTypes) => {
  const Onboarding = sequelize.define('Onboarding', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' }, // 🔥 fixed
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      unique: true,
    },
    bpi_account_no: DataTypes.STRING(50),
    sss_no: DataTypes.STRING(50),
    tin_no: DataTypes.STRING(50),
    pagibig_no: DataTypes.STRING(50),
    philhealth_no: DataTypes.STRING(50),

    uaf_ims: { type: DataTypes.BOOLEAN, defaultValue: false },
    office_pc_telework: { type: DataTypes.BOOLEAN, defaultValue: false },
    personal_pc_telework: { type: DataTypes.BOOLEAN, defaultValue: false },
    passport_ok: { type: DataTypes.BOOLEAN, defaultValue: false },
    imf_awareness_ok: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {
    tableName: 'onboarding_checkpoints',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
  });

  Onboarding.associate = (models) => {
    Onboarding.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return Onboarding;
};