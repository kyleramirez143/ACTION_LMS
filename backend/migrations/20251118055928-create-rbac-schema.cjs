'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // ----------------------------------------------------
  // IMPORTANT: 'Sequelize' MUST be the second argument
  // ----------------------------------------------------
  async up(queryInterface, Sequelize) { 

    // Helper function for PostgreSQL UUID column
    // This function MUST use the 'Sequelize' argument from the function signature.
    const uuidColumn = {
      type: Sequelize.UUID, 
      defaultValue: Sequelize.literal('gen_random_uuid()'),
      primaryKey: true,
      allowNull: false,
    };
    
    // Helper function for FK column
    const foreignKey = (references, key) => ({
      type: Sequelize.UUID, // <--- Uses the argument
      allowNull: false,
      references: {
        model: references, // Table name
        key: key,          // Primary key of the referenced table
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    const standardTimestamp = { 
      type: Sequelize.DATE, 
      defaultValue: Sequelize.literal('NOW()'),
      allowNull: false,
    };

    // --- Start of your actual migration code ---
    
    // PostgreSQL Specific: Enable UUID Generation Extension
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // 1. users table
    await queryInterface.createTable('users', {
      id: uuidColumn,
      first_name: { type: Sequelize.STRING(100) }, // <--- Uses the argument
      last_name:  { type: Sequelize.STRING(100) },
      email:      { 
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true,
      },
      is_active:  { type: Sequelize.BOOLEAN, defaultValue: true, allowNull: false },
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });

    // 2. Passwords Table
    await queryInterface.createTable('passwords', {
      id: uuidColumn,
      password: { 
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_id: foreignKey('users', 'id'),
      created_at: standardTimestamp,
      is_current: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
    });

    // 3. Roles Table
    await queryInterface.createTable('roles', {
      id: uuidColumn,
      name: { 
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.STRING(255),
      },
      created_at: standardTimestamp,
    });
    
    // 4. Permissions Table
    await queryInterface.createTable('permissions', {
      id: uuidColumn,
      type_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      created_at: standardTimestamp,
    });

    // 5. User_Roles Table (Join Table)
    await queryInterface.createTable('user_roles', {
      user_id: {
        ...foreignKey('users', 'id'),
        primaryKey: true,
      },
      role_id: {
        ...foreignKey('roles', 'id'),
        primaryKey: true,
      },
      created_at: standardTimestamp,
    });

    // 6. Role_Permissions Table (Join Table)
    await queryInterface.createTable('role_permissions', {
      id: uuidColumn, // Using UUID as a primary key for this join table
      role_id: foreignKey('roles', 'id'),
      permission_id: foreignKey('permissions', 'id'),
      created_at: standardTimestamp,
    });

  }, // End of up function

  async down(queryInterface, Sequelize) {
    // ----------------------------------------------------
    // IMPORTANT: 'Sequelize' MUST be the second argument here too
    // ----------------------------------------------------
    // Drop tables in reverse order of dependency
    await queryInterface.dropTable('role_permissions');
    await queryInterface.dropTable('user_roles');
    await queryInterface.dropTable('permissions');
    await queryInterface.dropTable('roles');
    await queryInterface.dropTable('passwords');
    await queryInterface.dropTable('users');
  }
};