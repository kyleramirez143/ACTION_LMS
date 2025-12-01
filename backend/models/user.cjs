// models/user.cjs
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4, // Sequelize default to match gen_random_uuid()
    },
    first_name: { type: DataTypes.STRING(100) },
    last_name: { type: DataTypes.STRING(100) },
    email: {
      type: DataTypes.STRING(150),
      unique: true,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: true, // Allow null if you haven't used updated_at on this table
    },
  }, {
    tableName: 'users',
    timestamps: false, // Set to false since you handle created_at/updated_at manually
    // Underscore: true maps camelCase attributes to snake_case column names (e.g., firstName to first_name)
    // Although your schema uses snake_case in the definition above, this is good practice.
    underscored: true,
  });

  User.associate = function (models) {
    // 1. One-to-One/Many relationship with Password
    // Used by login logic to find the hashed password
    User.hasOne(models.Password, {
      foreignKey: 'user_id',
      as: 'currentPassword' // Alias used in the authController query
    });

    // 2. Many-to-Many relationship with Role (via user_roles)
    User.belongsToMany(models.Role, {
      through: models.UserRole, // Junction Model
      foreignKey: 'user_id',
      otherKey: 'role_id',
      as: 'roles'
    });

    User.hasMany(models.UserRole, { foreignKey: "user_id", as: "user_roles" });
  };

  return User;
};