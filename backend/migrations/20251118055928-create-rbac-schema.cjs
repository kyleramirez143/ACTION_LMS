'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
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

    // Enable UUID generation extensions
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');

    // --------------------------
    // USERS
    // --------------------------
    await queryInterface.createTable('users', {
      id: uuidColumn,
      first_name: { type: Sequelize.STRING(100) },
      last_name: { type: Sequelize.STRING(100) },
      email: { type: Sequelize.STRING(150), allowNull: false, unique: true },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true, allowNull: false },
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });

    // PASSWORDS
    await queryInterface.createTable('passwords', {
      id: uuidColumn,
      password: { type: Sequelize.STRING, allowNull: false },
      user_id: foreignKey('users', 'id'),
      created_at: standardTimestamp,
      is_current: { type: Sequelize.BOOLEAN, defaultValue: true, allowNull: false },
    });
    await queryInterface.addIndex('passwords', ['user_id']);

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

    // USER_ROLES
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

    // --------------------------
    // COURSES, MODULES, LECTURES
    // --------------------------
    await queryInterface.createTable('courses', {
      course_id: uuidColumn,
      title: { type: Sequelize.STRING(255), allowNull: false },
      image: { type: Sequelize.STRING(255), allowNull: true },
      description: { type: Sequelize.TEXT },
      is_published: { type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false },
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });

    await queryInterface.createTable('course_instructors', {
      course_id: { ...foreignKey('courses', 'course_id'), primaryKey: true },
      managed_by: { ...foreignKey('users', 'id'), primaryKey: true },
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });
    await queryInterface.addIndex('course_instructors', ['course_id']);
    await queryInterface.addIndex('course_instructors', ['managed_by']);

    await queryInterface.createTable('modules', {
      module_id: uuidColumn,
      course_id: { ...foreignKey('courses', 'course_id'), allowNull: false },
      image: { type: Sequelize.STRING(255), allowNull: true },
      title: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT },
      created_by: { ...foreignKey('users', 'id'), allowNull: false, onDelete: 'SET NULL' },
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });
    await queryInterface.addIndex('modules', ['course_id']);
    await queryInterface.addIndex('modules', ['created_by']);

    await queryInterface.createTable('lectures', {
      lecture_id: uuidColumn,
      module_id: { ...foreignKey('modules', 'module_id'), allowNull: false },
      created_by: { ...foreignKey('users', 'id'), allowNull: false, onDelete: 'SET NULL' },
      title: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT },
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });
    await queryInterface.addIndex('lectures', ['module_id']);
    await queryInterface.addIndex('lectures', ['created_by']);

    // Resources
    await queryInterface.createTable('resources', {
      resource_id: uuidColumn,
      file_url: { type: Sequelize.STRING(500), allowNull: false },
      created_at: standardTimestamp,
    });

    // Lecture_Resources
    await queryInterface.createTable('lecture_resources', {
      lecture_id: { ...foreignKey('lectures', 'lecture_id'), primaryKey: true },
      resources_id: { ...foreignKey('resources', 'resource_id'), primaryKey: true },
      created_at: standardTimestamp,
    });
    await queryInterface.addIndex('lecture_resources', ['lecture_id']);
    await queryInterface.addIndex('lecture_resources', ['resources_id']);

    // You can continue similarly for other tables (assessments, assessment_questions, grades, etc.)
    // Make sure all PKs are UUIDs and add indexes for FK columns
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('lecture_resources');
    await queryInterface.dropTable('resources');
    await queryInterface.dropTable('lectures');
    await queryInterface.dropTable('modules');
    await queryInterface.dropTable('course_instructors');
    await queryInterface.dropTable('courses');
    await queryInterface.dropTable('role_permissions');
    await queryInterface.dropTable('user_roles');
    await queryInterface.dropTable('permissions');
    await queryInterface.dropTable('roles');
    await queryInterface.dropTable('passwords');
    await queryInterface.dropTable('users');
  },
};
