// models/role.cjs
module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
    description: { type: DataTypes.TEXT },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'roles',
    timestamps: false,
    underscored: true,
  });

  Role.associate = function(models) {
    // 1. Many-to-Many relationship with User (via user_roles)
    Role.belongsToMany(models.User, {
      through: models.UserRole,
      foreignKey: 'role_id',
      otherKey: 'user_id',
      as: 'users'
    });

    // 2. Many-to-Many relationship with Permission (via role_permissions)
    Role.belongsToMany(models.Permission, {
      through: models.RolePermission, // Junction Model
      foreignKey: 'role_id',
      otherKey: 'permission_id',
      as: 'permissions'
    });
  };

  return Role;
};