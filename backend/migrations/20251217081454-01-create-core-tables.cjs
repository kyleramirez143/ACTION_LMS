'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // --------------------------
    // HELPERS & CONSTANTS
    // --------------------------
    const uuidColumn = {
      type: Sequelize.UUID,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
      primaryKey: true,
      allowNull: false,
    };

    const foreignKey = (references, key, allowNull = false, onDelete = 'CASCADE') => ({
      type: Sequelize.UUID,
      allowNull,
      references: { model: references, key },
      onUpdate: 'CASCADE',
      onDelete,
    });

    const standardTimestamp = {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
      allowNull: false,
    };

    // Enable Extensions
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
    await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS btree_gist;`);

    // --------------------------
    // BATCH & CURRICULUM TABLES
    // --------------------------

    // BATCHES
    await queryInterface.createTable('batches', {
      batch_id: uuidColumn,
      name: { type: Sequelize.STRING(255), allowNull: false },
      location: { type: Sequelize.STRING(50) },
      start_date: { type: Sequelize.DATEONLY },
      end_date: { type: Sequelize.DATEONLY },
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });

    // CURRICULUMS
    await queryInterface.createTable('curriculums', {
      curriculum_id: uuidColumn,
      batch_id: foreignKey('batches', 'batch_id'),
      name: { type: Sequelize.STRING(255) },
      start_date: { type: Sequelize.DATEONLY, allowNull: false },
      end_date: { type: Sequelize.DATEONLY, allowNull: false },
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });

    // QUARTERS
    await queryInterface.createTable('quarters', {
      quarter_id: uuidColumn,
      curriculum_id: foreignKey('curriculums', 'curriculum_id'),
      name: { type: Sequelize.STRING(100) },
      start_date: { type: Sequelize.DATEONLY, allowNull: false },
      end_date: { type: Sequelize.DATEONLY, allowNull: false },
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });

    // --------------------------
    // USER & ACCESS CONTROL
    // --------------------------

    // USERS
    await queryInterface.createTable('users', {
      id: uuidColumn,
      first_name: { type: Sequelize.STRING(100) },
      last_name: { type: Sequelize.STRING(100) },
      email: { type: Sequelize.STRING(150), allowNull: false, unique: true }, 
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true, allowNull: false },
      profile_picture: { type: Sequelize.STRING(255) },
      location: { type: Sequelize.STRING(150) },
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });

    // PASSWORDS
    await queryInterface.createTable('passwords', {
      id: uuidColumn,
      password: { type: Sequelize.STRING, allowNull: false },
      user_id: foreignKey('users', 'id'),
      is_current: { type: Sequelize.BOOLEAN, defaultValue: true, allowNull: false },
      created_at: standardTimestamp,
    });

    // ROLES
    await queryInterface.createTable('roles', {
      id: uuidColumn,
      name: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      description: { type: Sequelize.STRING(255) },
      created_at: standardTimestamp,
    });

    // PERMISSIONS
    await queryInterface.createTable('permissions', {
      id: uuidColumn,
      type_name: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      created_at: standardTimestamp,
    });

    // USER_ROLES (Junction table with Composite Primary Key)
    await queryInterface.createTable('user_roles', {
      user_id: { ...foreignKey('users', 'id'), primaryKey: true },
      role_id: { ...foreignKey('roles', 'id'), primaryKey: true },
      created_at: standardTimestamp,
    });

    // ROLE_PERMISSIONS
    await queryInterface.createTable('role_permissions', {
      id: uuidColumn,
      role_id: foreignKey('roles', 'id'),
      permission_id: foreignKey('permissions', 'id'),
      created_at: standardTimestamp,
    });
    
    // ONBOARDING_CHECKPOINTS
    await queryInterface.createTable('onboarding_checkpoints', {

      user_id: foreignKey('users', 'id'),

      bpi_account_no: { type: Sequelize.STRING(50), allowNull: true },
      sss_no: { type: Sequelize.STRING(50), allowNull: true },
      tin_no: { type: Sequelize.STRING(50), allowNull: true },
      pagibig_no: { type: Sequelize.STRING(50), allowNull: true },
      philhealth_no: { type: Sequelize.STRING(50), allowNull: true },

      uaf_ims: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      office_pc_telework: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      personal_pc_telework: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      passport_ok: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      imf_awareness_ok: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },

      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });

    await queryInterface.addIndex('onboarding_checkpoints', ['user_id']);
  },

  

  async down(queryInterface, Sequelize) {
    // Drop in reverse order to respect foreign key constraints
    await queryInterface.dropTable('onboarding_checkpoints');
    await queryInterface.dropTable('role_permissions');
    await queryInterface.dropTable('user_roles');
    await queryInterface.dropTable('permissions');
    await queryInterface.dropTable('roles');
    await queryInterface.dropTable('passwords');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('quarters');
    await queryInterface.dropTable('curriculums');
    await queryInterface.dropTable('batches');
  },
};
