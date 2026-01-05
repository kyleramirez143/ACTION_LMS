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

    // Enable UUID generation extensions (Best practice for PostgreSQL)
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');

    // --------------------------
    // CORE TABLES (USERS, ROLES, PERMISSIONS)
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

    // USER_ROLES (Junction table)
    await queryInterface.createTable('user_roles', {
      user_id: { ...foreignKey('users', 'id'), primaryKey: true },
      role_id: { ...foreignKey('roles', 'id'), primaryKey: true },
      created_at: standardTimestamp,
    });

    // ROLE_PERMISSIONS (Junction table)
    await queryInterface.createTable('role_permissions', {
      id: uuidColumn,
      role_id: foreignKey('roles', 'id'),
      permission_id: foreignKey('permissions', 'id'),
      created_at: standardTimestamp,
    });

    // --------------------------
    // COURSE STRUCTURE
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

    // COURSE_INSTRUCTORS (Junction table for many-to-many relationship)
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
      // Note: Setting onDelete to 'SET NULL' on the foreignKey call will ignore the default 'CASCADE'
      created_by: { ...foreignKey('users', 'id', false, 'SET NULL'), allowNull: false },
      is_visible: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });
    await queryInterface.addIndex('modules', ['course_id']);
    await queryInterface.addIndex('modules', ['created_by']);

    await queryInterface.createTable('lectures', {
      lecture_id: uuidColumn,
      module_id: { ...foreignKey('modules', 'module_id'), allowNull: false },
      // Note: Setting onDelete to 'SET NULL' on the foreignKey call will ignore the default 'CASCADE'
      created_by: { ...foreignKey('users', 'id', false, 'SET NULL'), allowNull: false },
      title: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT },
      is_visible: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });
    await queryInterface.addIndex('lectures', ['module_id']);
    await queryInterface.addIndex('lectures', ['created_by']);

    // RESOURCES
    await queryInterface.createTable('resources', {
      resource_id: uuidColumn,
      file_url: { type: Sequelize.STRING(500), allowNull: false },
      is_visible: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: standardTimestamp,
    });

    // LECTURE_RESOURCES (Junction table)
    await queryInterface.createTable('lecture_resources', {
      lecture_id: { ...foreignKey('lectures', 'lecture_id'), primaryKey: true },
      resources_id: { ...foreignKey('resources', 'resource_id'), primaryKey: true },
      created_at: standardTimestamp,
    });
    await queryInterface.addIndex('lecture_resources', ['lecture_id']);
    await queryInterface.addIndex('lecture_resources', ['resources_id']);

    // --------------------------
    // ASSESSMENT & GRADING
    // --------------------------

    // Note: The second migration references 'assessment_types' but does not define it. 
    // Creating a placeholder table for 'assessment_types' to satisfy the FK constraint in 'assessments'.
    await queryInterface.createTable('assessment_types', {
      assessment_type_id: uuidColumn,
      name: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      created_at: standardTimestamp,
    });

    await queryInterface.createTable('assessments', {
      assessment_id: uuidColumn,
      title: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT },
      pdf_source_url: { type: Sequelize.TEXT },
      assessment_type_id: foreignKey('assessment_types', 'assessment_type_id'),
      is_published: { type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false },
      created_by: foreignKey('users', 'id'),
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });
    await queryInterface.addIndex('assessments', ['assessment_type_id']);
    await queryInterface.addIndex('assessments', ['created_by']); // Changed index to separate fields for better coverage

    // ASSESSMENT QUESTIONS
    await queryInterface.createTable('assessment_questions', {
      question_id: uuidColumn,
      assessment_id: foreignKey('assessments', 'assessment_id'),
      question_text: { type: Sequelize.TEXT, allowNull: false },
      explanations: { type: Sequelize.TEXT, allowNull: true },
      options: { type: Sequelize.JSON },
      correct_answer: { type: Sequelize.JSON },
      points: { type: Sequelize.INTEGER, defaultValue: 1 },
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });
    await queryInterface.addIndex('assessment_questions', ['assessment_id']);

    // ASSESSMENT RESPONSES
    await queryInterface.createTable('assessment_responses', {
      response_id: uuidColumn,
      assessment_id: foreignKey('assessments', 'assessment_id'),
      user_id: foreignKey('users', 'id'),
      question_id: foreignKey('assessment_questions', 'question_id'),
      answer: { type: Sequelize.JSON },
      score: { type: Sequelize.DECIMAL(5, 2) },
      feedback: { type: Sequelize.TEXT },
      submitted_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()'), allowNull: false },
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });
    await queryInterface.addIndex('assessment_responses', ['assessment_id', 'user_id', 'question_id']);

    // LECTURE_ASSESSMENTS (Junction table)
    await queryInterface.createTable('lecture_assessments', {
      lecture_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: 'lectures', key: 'lecture_id' }, // Correctly set references
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      assessment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: 'assessments', key: 'assessment_id' }, // Correctly set references
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: standardTimestamp,
    });

    // GRADES
    await queryInterface.createTable('grades', {
      grade_id: uuidColumn,
      user_id: foreignKey('users', 'id'),
      assessment_id: foreignKey('assessments', 'assessment_id'),
      grade_type: { type: Sequelize.STRING(50) },
      score: { type: Sequelize.DECIMAL(5, 2) },
      weight: { type: Sequelize.DECIMAL(5, 2) },
      calculated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()'), allowNull: false },
      remarks: { type: Sequelize.TEXT },
      overridden_by: foreignKey('users', 'id', true, 'SET NULL'),
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });
    await queryInterface.addIndex('grades', ['user_id', 'assessment_id']);

    // --------------------------
    // AI & PROCTORING
    // --------------------------

    // AI_INSIGHTS
    await queryInterface.createTable('ai_insights', {
      insight_id: uuidColumn,
      user_id: foreignKey('users', 'id'),
      generated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()'), allowNull: false },
      weakness_summary: { type: Sequelize.TEXT },
      improvement_areas_json: { type: Sequelize.JSON },
      recommended_courses_json: { type: Sequelize.JSON },
      confidence_score: { type: Sequelize.DECIMAL(5, 2) },
      reviewed_by: foreignKey('users', 'id', true, 'SET NULL'),
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });
    await queryInterface.addIndex('ai_insights', ['user_id']);

    // ASSESSMENT_SCREEN_SESSIONS (Proctoring/Recording)
    await queryInterface.createTable('assessment_screen_sessions', {
      session_id: uuidColumn, // Replaced explicit definition with reusable uuidColumn
      assessment_id: foreignKey('assessments', 'assessment_id'),
      user_id: foreignKey('users', 'id'),
      start_time: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
        allowNull: false,
      },
      end_time: {
        type: Sequelize.DATE,
      },
      recording_url: {
        type: Sequelize.TEXT,
      },
      status: {
        type: Sequelize.STRING(20),
        defaultValue: 'active',
        allowNull: false,
      },
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });

    // Indexes for assessment_screen_sessions
    await queryInterface.addIndex('assessment_screen_sessions', ['user_id']);
    await queryInterface.addIndex('assessment_screen_sessions', ['assessment_id']);
    await queryInterface.addIndex('assessment_screen_sessions', ['user_id', 'assessment_id']);
  },

  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order of creation to avoid foreign key constraints issues.

    // AI & Proctoring
    await queryInterface.dropTable('assessment_screen_sessions');
    await queryInterface.dropTable('ai_insights');

    // Assessment & Grading
    await queryInterface.dropTable('grades');
    await queryInterface.dropTable('lecture_assessments');
    await queryInterface.dropTable('assessment_responses');
    await queryInterface.dropTable('assessment_questions');
    await queryInterface.dropTable('assessments');
    await queryInterface.dropTable('assessment_types'); // Added drop for placeholder table

    // Course Structure
    await queryInterface.dropTable('lecture_resources');
    await queryInterface.dropTable('resources');
    await queryInterface.dropTable('lectures');
    await queryInterface.dropTable('modules');
    await queryInterface.dropTable('course_instructors');
    await queryInterface.dropTable('courses');

    // Core Tables
    await queryInterface.dropTable('role_permissions');
    await queryInterface.dropTable('user_roles');
    await queryInterface.dropTable('permissions');
    await queryInterface.dropTable('roles');
    await queryInterface.dropTable('passwords');
    await queryInterface.dropTable('users');
  },
};