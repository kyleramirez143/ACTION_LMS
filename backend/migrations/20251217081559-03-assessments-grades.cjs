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

    // ASSESSMENT TYPES
    await queryInterface.createTable('assessment_types', {
      assessment_type_id: uuidColumn,
      name: { type: Sequelize.STRING(100), allowNull: false },
      description: { type: Sequelize.TEXT },
      weight: { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 0.00 },
      passing_criteria: { type: Sequelize.DECIMAL(5, 2), defaultValue: 70.00 },
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });

    // ASSESSMENTS
    await queryInterface.createTable('assessments', {
      assessment_id: uuidColumn,
      title: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT },
      pdf_source_url: { type: Sequelize.TEXT },
      assessment_type_id: foreignKey('assessment_types', 'assessment_type_id'),
      is_published: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_by: foreignKey('users', 'id', true, 'SET NULL'),
      attempts: { type: Sequelize.INTEGER, defaultValue: 1 },
      instructions: { type: Sequelize.TEXT },
      passing_score: { type: Sequelize.DECIMAL(5, 2), defaultValue: 70 },
      time_limit: { type: Sequelize.INTEGER, defaultValue: 30 },
      screen_monitoring: { type: Sequelize.BOOLEAN, defaultValue: true },
      randomize_questions: { type: Sequelize.BOOLEAN, defaultValue: true },
      show_score: { type: Sequelize.BOOLEAN, defaultValue: true },
      show_explanations: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });
    await queryInterface.addIndex('assessments', ['assessment_type_id', 'created_by']);

    // ASSESSMENT QUESTIONS
    await queryInterface.createTable('assessment_questions', {
      question_id: uuidColumn,
      assessment_id: foreignKey('assessments', 'assessment_id'),
      question_text: { type: Sequelize.TEXT, allowNull: false },
      explanations: { type: Sequelize.TEXT },
      options: { type: Sequelize.JSON },
      correct_answer: { type: Sequelize.JSON },
      points: { type: Sequelize.INTEGER, defaultValue: 1 },
      section: { type: Sequelize.STRING(50) },
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });

    // ASSESSMENT RESPONSES
    await queryInterface.createTable('assessment_responses', {
      response_id: uuidColumn,
      assessment_id: foreignKey('assessments', 'assessment_id'),
      user_id: foreignKey('users', 'id'),
      question_id: foreignKey('assessment_questions', 'question_id'),
      answer: { type: Sequelize.JSON },
      score: { type: Sequelize.DECIMAL(5, 2) },
      feedback: { type: Sequelize.TEXT },
      submitted_at: standardTimestamp,
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });
    await queryInterface.addIndex('assessment_responses', ['assessment_id', 'user_id', 'question_id']);

    // GRADES
    await queryInterface.createTable('grades', {
      grade_id: uuidColumn,
      user_id: foreignKey('users', 'id'),
      assessment_id: foreignKey('assessments', 'assessment_id'),
      grade_type: { type: Sequelize.STRING(50) },
      score: { type: Sequelize.DECIMAL(5, 2) },
      weight: { type: Sequelize.DECIMAL(5, 2) },
      remarks: { type: Sequelize.TEXT },
      overridden_by: foreignKey('users', 'id', true, 'SET NULL'),
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });

    // AI INSIGHTS
    await queryInterface.createTable('ai_insights', {
      insight_id: uuidColumn,
      user_id: foreignKey('users', 'id'),
      generated_at: standardTimestamp,
      weakness_summary: { type: Sequelize.TEXT },
      improvement_areas_json: { type: Sequelize.JSON },
      recommended_courses_json: { type: Sequelize.JSON },
      confidence_score: { type: Sequelize.DECIMAL(5, 2) },
      reviewed_by: foreignKey('users', 'id', true, 'SET NULL'),
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });

    // ASSESSMENT SCREEN SESSIONS
    await queryInterface.createTable('assessment_screen_sessions', {
      session_id: uuidColumn,
      assessment_id: foreignKey('assessments', 'assessment_id'),
      user_id: foreignKey('users', 'id'),
      start_time: standardTimestamp,
      end_time: { type: Sequelize.DATE },
      recording_url: { type: Sequelize.TEXT },
      status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'active' },
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });

    // USER_BATCHES (Junction Table)
    await queryInterface.createTable('user_batches', {
      user_id: { ...foreignKey('users', 'id'), primaryKey: true },
      batch_id: { ...foreignKey('batches', 'batch_id'), primaryKey: true },
      assigned_at: standardTimestamp,
    });

    // ASSESSMENT WEIGHT CHANGES
    await queryInterface.createTable('assessment_weight_changes', {
      change_id: uuidColumn,
      assessment_id: foreignKey('assessments', 'assessment_id'),
      new_weight: { type: Sequelize.DECIMAL(5, 2), allowNull: false },
      changed_by: foreignKey('users', 'id', true, 'SET NULL'),
      change_timestamp: standardTimestamp,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('assessment_weight_changes');
    await queryInterface.dropTable('user_batches');
    await queryInterface.dropTable('assessment_screen_sessions');
    await queryInterface.dropTable('ai_insights');
    await queryInterface.dropTable('grades');
    await queryInterface.dropTable('assessment_responses');
    await queryInterface.dropTable('assessment_questions');
    await queryInterface.dropTable('assessments');
    await queryInterface.dropTable('assessment_types');
  },
};
