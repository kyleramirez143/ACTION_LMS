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
      // ... rest of FK definition
    });

    // --- Start of your actual migration code ---
    
    // PostgreSQL Specific: Enable UUID Generation Extension
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // 1. users table
    await queryInterface.createTable('users', {
      id: uuidColumn,
      first_name: { type: Sequelize.STRING(100) }, // <--- Uses the argument
      // ... rest of table definitions
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
    });
    
    // ... continue with other table creations (passwords, roles, etc.)

  }, // End of up function

  async down(queryInterface, Sequelize) {
    // ----------------------------------------------------
    // IMPORTANT: 'Sequelize' MUST be the second argument here too
    // ----------------------------------------------------
    // Drop tables in reverse order of dependency
    await queryInterface.dropTable('role_permissions');
    // ... rest of drop statements
    await queryInterface.dropTable('users');
  }
};