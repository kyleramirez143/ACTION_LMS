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

    const foreignKey = (references, key) => ({
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: references, key },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    const standardTimestamp = { 
      type: Sequelize.DATE, 
      defaultValue: Sequelize.literal('NOW()'),
      allowNull: false,
    };

    // Enable UUID extension
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // 1. Courses
    await queryInterface.createTable('courses', {
      course_id: uuidColumn,
      title: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT },
      instructor_id: foreignKey('users', 'id'), // FK to users.id
      is_published: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });

    // 2. Modules
    await queryInterface.createTable('modules', {
      module_id: uuidColumn,
      course_id: foreignKey('courses', 'course_id'),
      title: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT },
      created_by: foreignKey('users', 'id'),
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });

    // 3. Lectures
    await queryInterface.createTable('lectures', {
      lecture_id: uuidColumn,
      module_id: foreignKey('modules', 'module_id'),
      course_id: foreignKey('courses', 'course_id'),
      title: { type: Sequelize.STRING(255), allowNull: false },
      content_type: { type: Sequelize.STRING(50) },
      content_url: { type: Sequelize.TEXT },
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });

    // 4. Assessments
    await queryInterface.createTable('assessments', {
      assessment_id: uuidColumn,
      title: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT },
      pdf_source_url: { type: Sequelize.TEXT },
      lecture_id: { type: Sequelize.UUID, references: { model: 'lectures', key: 'lecture_id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      module_id: { type: Sequelize.UUID, references: { model: 'modules', key: 'module_id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      course_id: { type: Sequelize.UUID, references: { model: 'courses', key: 'course_id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      is_published: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_by: foreignKey('users', 'id'),
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });

    // 5. Assessment Questions
    await queryInterface.createTable('assessment_questions', {
      question_id: uuidColumn,
      assessment_id: foreignKey('assessments', 'assessment_id'),
      question_text: { type: Sequelize.TEXT, allowNull: false },
      options: { type: Sequelize.JSON },
      correct_answer: { type: Sequelize.TEXT },
      points: { type: Sequelize.INTEGER, defaultValue: 1 },
    });

    // 6. Assessment Responses
    await queryInterface.createTable('assessment_responses', {
      response_id: uuidColumn,
      assessment_id: foreignKey('assessments', 'assessment_id'),
      user_id: foreignKey('users', 'id'),
      question_id: foreignKey('assessment_questions', 'question_id'),
      answer: { type: Sequelize.TEXT },
      score: { type: Sequelize.DECIMAL(5, 2) },
      feedback: { type: Sequelize.TEXT },
      submitted_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
    });

    // 7. Grades
    await queryInterface.createTable('grades', {
      grade_id: uuidColumn,
      user_id: foreignKey('users', 'id'),
      course_id: { type: Sequelize.UUID, references: { model: 'courses', key: 'course_id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      module_id: { type: Sequelize.UUID, references: { model: 'modules', key: 'module_id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      assessment_id: { type: Sequelize.UUID, references: { model: 'assessments', key: 'assessment_id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      grade_type: { type: Sequelize.STRING(50) },
      score: { type: Sequelize.DECIMAL(5, 2) },
      weight: { type: Sequelize.DECIMAL(5, 2) },
      calculated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      remarks: { type: Sequelize.TEXT },
      overridden_by: { type: Sequelize.UUID, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
    });

    // 8. AI Insights
    await queryInterface.createTable('ai_insights', {
      insight_id: uuidColumn,
      user_id: foreignKey('users', 'id'),
      generated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      weakness_summary: { type: Sequelize.TEXT },
      improvement_areas_json: { type: Sequelize.JSON },
      recommended_courses_json: { type: Sequelize.JSON },
      confidence_score: { type: Sequelize.DECIMAL(5, 2) },
      reviewed_by: { type: Sequelize.UUID, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ai_insights');
    await queryInterface.dropTable('grades');
    await queryInterface.dropTable('assessment_responses');
    await queryInterface.dropTable('assessment_questions');
    await queryInterface.dropTable('assessments');
    await queryInterface.dropTable('lectures');
    await queryInterface.dropTable('modules');
    await queryInterface.dropTable('courses');

    // Drop RBAC tables in reverse order
    await queryInterface.dropTable('role_permissions');
    await queryInterface.dropTable('user_roles');
    await queryInterface.dropTable('permissions');
    await queryInterface.dropTable('roles');
    await queryInterface.dropTable('passwords');
    await queryInterface.dropTable('users');
  },
};