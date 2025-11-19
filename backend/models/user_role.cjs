// backend/models/user_role.cjs
module.exports = (sequelize, DataTypes) => {
  const UserRole = sequelize.define('UserRole', {
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true, // Composite Primary Key Part 1
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true, // Composite Primary Key Part 2
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'user_roles',
    timestamps: false,
    underscored: true,
  });

  return UserRole;
};