// backend/models/password.cjs
module.exports = (sequelize, DataTypes) => {
  const Password = sequelize.define('Password', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    password: { // This is the HASHED password field
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_id: { // Foreign Key to the User table
      type: DataTypes.UUID,
      allowNull: false,
    },
    is_current: { // IMPORTANT: Used to find the active password
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'passwords',
    timestamps: false,
    underscored: true,
  });

  Password.associate = function(models) {
    // One-to-One/Many relationship with User
    Password.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return Password;
};