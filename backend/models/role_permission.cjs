// backend/models/role_permission.cjs
module.exports = (sequelize, DataTypes) => {
  const RolePermission = sequelize.define('RolePermission', {
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true, // Composite Primary Key Part 1
    },
    permission_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true, // Composite Primary Key Part 2
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'role_permissions',
    timestamps: false,
    underscored: true,
  });

  return RolePermission;
};