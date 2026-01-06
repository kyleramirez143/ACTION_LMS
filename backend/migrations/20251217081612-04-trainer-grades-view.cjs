'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Extensions (safe, idempotent)
    await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;`);
    await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;`);

    // Tables
    await queryInterface.createTable('users', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      first_name: { type: Sequelize.STRING(100) },
      last_name: { type: Sequelize.STRING(100) },
      email: { type: Sequelize.STRING(150), allowNull: false },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
      profile_picture: { type: Sequelize.STRING(255) },
    });

    await queryInterface.createTable('roles', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      name: { type: Sequelize.STRING(50), allowNull: false },
      description: { type: Sequelize.STRING(255) },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
    });

    await queryInterface.createTable('permissions', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      type_name: { type: Sequelize.STRING(100), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
    });

    await queryInterface.createTable('role_permissions', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      role_id: { type: Sequelize.UUID, allowNull: false },
      permission_id: { type: Sequelize.UUID, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
    });

    await queryInterface.createTable('user_roles', {
      user_id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      role_id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
    });

    await queryInterface.createTable('passwords', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      password: { type: Sequelize.STRING(255), allowNull: false },
      user_id: { type: Sequelize.UUID, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
      is_current: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
    });

    await queryInterface.createTable('courses', {
      course_id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      title: { type: Sequelize.STRING(255), allowNull: false },
      image: { type: Sequelize.STRING(255) },
      description: { type: Sequelize.TEXT },
      is_published: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
    });

    await queryInterface.createTable('modules', {
      module_id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      course_id: { type: Sequelize.UUID, allowNull: false },
      image: { type: Sequelize.STRING(255) },
      title: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT },
      created_by: { type: Sequelize.UUID, allowNull: false },
      is_visible: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
    });

    await queryInterface.createTable('lectures', {
      lecture_id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      module_id: { type: Sequelize.UUID, allowNull: false },
      created_by: { type: Sequelize.UUID, allowNull: false },
      title: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT },
      is_visible: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
    });

    await queryInterface.createTable('resources', {
      resource_id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      file_url: { type: Sequelize.STRING(500), allowNull: false },
      is_visible: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
    });

    await queryInterface.createTable('lecture_resources', {
      lecture_id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      resources_id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
    });

    await queryInterface.createTable('assessment_types', {
      assessment_type_id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      name: { type: Sequelize.STRING(50), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
    });

    await queryInterface.createTable('assessments', {
      assessment_id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      title: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT },
      pdf_source_url: { type: Sequelize.TEXT },
      assessment_type_id: { type: Sequelize.UUID, allowNull: false },
      is_published: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_by: { type: Sequelize.UUID, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
      attempts: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      time_limit: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 30 },
      screen_monitoring: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      randomize_questions: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      show_score: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      show_explanations: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      due_date: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
      passing_score: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 70 },
    });

    await queryInterface.createTable('assessment_questions', {
      question_id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      assessment_id: { type: Sequelize.UUID, allowNull: false },
      question_text: { type: Sequelize.TEXT, allowNull: false },
      explanations: { type: Sequelize.TEXT },
      options: { type: Sequelize.JSON },
      correct_answer: { type: Sequelize.JSON },
      points: { type: Sequelize.INTEGER, defaultValue: 1 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
      section: { type: Sequelize.STRING(50) },
    });

    await queryInterface.createTable('assessment_responses', {
      response_id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      assessment_id: { type: Sequelize.UUID, allowNull: false },
      user_id: { type: Sequelize.UUID, allowNull: false },
      question_id: { type: Sequelize.UUID, allowNull: false },
      answer: { type: Sequelize.JSON },
      score: { type: Sequelize.DECIMAL(5, 2) },
      feedback: { type: Sequelize.TEXT },
      submitted_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
    });

    await queryInterface.createTable('assessment_screen_sessions', {
      session_id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      assessment_id: { type: Sequelize.UUID, allowNull: false },
      user_id: { type: Sequelize.UUID, allowNull: false },
      start_time: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
      end_time: { type: Sequelize.DATE },
      recording_url: { type: Sequelize.TEXT },
      status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'active' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
    });

    await queryInterface.createTable('lecture_assessments', {
      lecture_id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      assessment_id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
    });

    await queryInterface.createTable('grades', {
      grade_id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      user_id: { type: Sequelize.UUID, allowNull: false },
      assessment_id: { type: Sequelize.UUID, allowNull: false },
      grade_type: { type: Sequelize.STRING(50) },
      score: { type: Sequelize.DECIMAL(5, 2) },
      weight: { type: Sequelize.DECIMAL(5, 2) },
      calculated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
      remarks: { type: Sequelize.TEXT },
      overridden_by: { type: Sequelize.UUID },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
    });

    await queryInterface.createTable('course_instructors', {
      course_id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      managed_by: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
    });

    await queryInterface.createTable('batches', {
      batch_id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      name: { type: Sequelize.STRING(255), allowNull: false },
      location: { type: Sequelize.STRING(50) },
      start_date: { type: Sequelize.DATEONLY },
      end_date: { type: Sequelize.DATEONLY },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
    });

    await queryInterface.createTable('curriculums', {
      curriculum_id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      batch_id: { type: Sequelize.UUID, allowNull: false },
      name: { type: Sequelize.STRING(255) },
      start_date: { type: Sequelize.DATEONLY, allowNull: false },
      end_date: { type: Sequelize.DATEONLY, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('now()') },
    });

    await queryInterface.createTable('user_batches', {
      user_id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      batch_id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      assigned_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
    });

    await queryInterface.createTable('ai_insights', {
      insight_id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      user_id: { type: Sequelize.UUID, allowNull: false },
      generated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
      weakness_summary: { type: Sequelize.TEXT },
      improvement_areas_json: { type: Sequelize.JSON },
      recommended_courses_json: { type: Sequelize.JSON },
      confidence_score: { type: Sequelize.DECIMAL(5, 2) },
      reviewed_by: { type: Sequelize.UUID },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('now()') },
    });

    // Unique Constraints
    await queryInterface.addConstraint('users', { fields: ['email'], type: 'unique', name: 'users_email_key' });
    await queryInterface.addConstraint('roles', { fields: ['name'], type: 'unique', name: 'roles_name_key' });
    await queryInterface.addConstraint('permissions', { fields: ['type_name'], type: 'unique', name: 'permissions_type_name_key' });
    await queryInterface.addConstraint('assessment_types', { fields: ['name'], type: 'unique', name: 'assessment_types_name_key' });

    // Foreign keys
    await queryInterface.addConstraint('passwords', {
      fields: ['user_id'],
      type: 'foreign key',
      references: { table: 'users', field: 'id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('role_permissions', {
      fields: ['role_id'],
      type: 'foreign key',
      references: { table: 'roles', field: 'id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('role_permissions', {
      fields: ['permission_id'],
      type: 'foreign key',
      references: { table: 'permissions', field: 'id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('user_roles', {
      fields: ['user_id'],
      type: 'foreign key',
      references: { table: 'users', field: 'id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('user_roles', {
      fields: ['role_id'],
      type: 'foreign key',
      references: { table: 'roles', field: 'id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('modules', {
      fields: ['course_id'],
      type: 'foreign key',
      references: { table: 'courses', field: 'course_id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('modules', {
      fields: ['created_by'],
      type: 'foreign key',
      references: { table: 'users', field: 'id' },
      onUpdate: 'CASCADE', onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('lectures', {
      fields: ['module_id'],
      type: 'foreign key',
      references: { table: 'modules', field: 'module_id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('lectures', {
      fields: ['created_by'],
      type: 'foreign key',
      references: { table: 'users', field: 'id' },
      onUpdate: 'CASCADE', onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('lecture_resources', {
      fields: ['lecture_id'],
      type: 'foreign key',
      references: { table: 'lectures', field: 'lecture_id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('lecture_resources', {
      fields: ['resources_id'],
      type: 'foreign key',
      references: { table: 'resources', field: 'resource_id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('assessments', {
      fields: ['assessment_type_id'],
      type: 'foreign key',
      references: { table: 'assessment_types', field: 'assessment_type_id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('assessments', {
      fields: ['created_by'],
      type: 'foreign key',
      references: { table: 'users', field: 'id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('assessment_questions', {
      fields: ['assessment_id'],
      type: 'foreign key',
      references: { table: 'assessments', field: 'assessment_id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('assessment_responses', {
      fields: ['assessment_id'],
      type: 'foreign key',
      references: { table: 'assessments', field: 'assessment_id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('assessment_responses', {
      fields: ['question_id'],
      type: 'foreign key',
      references: { table: 'assessment_questions', field: 'question_id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('assessment_responses', {
      fields: ['user_id'],
      type: 'foreign key',
      references: { table: 'users', field: 'id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('assessment_screen_sessions', {
      fields: ['assessment_id'],
      type: 'foreign key',
      references: { table: 'assessments', field: 'assessment_id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('assessment_screen_sessions', {
      fields: ['user_id'],
      type: 'foreign key',
      references: { table: 'users', field: 'id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('lecture_assessments', {
      fields: ['assessment_id'],
      type: 'foreign key',
      references: { table: 'assessments', field: 'assessment_id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('lecture_assessments', {
      fields: ['lecture_id'],
      type: 'foreign key',
      references: { table: 'lectures', field: 'lecture_id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('grades', {
      fields: ['assessment_id'],
      type: 'foreign key',
      references: { table: 'assessments', field: 'assessment_id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('grades', {
      fields: ['user_id'],
      type: 'foreign key',
      references: { table: 'users', field: 'id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('grades', {
      fields: ['overridden_by'],
      type: 'foreign key',
      references: { table: 'users', field: 'id' },
      onUpdate: 'CASCADE', onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('course_instructors', {
      fields: ['course_id'],
      type: 'foreign key',
      references: { table: 'courses', field: 'course_id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('course_instructors', {
      fields: ['managed_by'],
      type: 'foreign key',
      references: { table: 'users', field: 'id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('curriculums', {
      fields: ['batch_id'],
      type: 'foreign key',
      references: { table: 'batches', field: 'batch_id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('user_batches', {
      fields: ['user_id'],
      type: 'foreign key',
      references: { table: 'users', field: 'id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('user_batches', {
      fields: ['batch_id'],
      type: 'foreign key',
      references: { table: 'batches', field: 'batch_id' },
      onUpdate: 'CASCADE', onDelete: 'CASCADE',
    });

    // Indexes
    await queryInterface.addIndex('ai_insights', ['user_id'], { name: 'ai_insights_user_id' });
    await queryInterface.addIndex('assessment_questions', ['assessment_id'], { name: 'assessment_questions_assessment_id' });
    await queryInterface.addIndex('assessment_responses', ['assessment_id', 'user_id', 'question_id'], { name: 'assessment_responses_assessment_id_user_id_question_id' });
    await queryInterface.addIndex('assessment_screen_sessions', ['assessment_id'], { name: 'assessment_screen_sessions_assessment_id' });
    await queryInterface.addIndex('assessment_screen_sessions', ['user_id'], { name: 'assessment_screen_sessions_user_id' });
    await queryInterface.addIndex('assessment_screen_sessions', ['user_id', 'assessment_id'], { name: 'assessment_screen_sessions_user_id_assessment_id' });
    await queryInterface.addIndex('assessments', ['assessment_type_id'], { name: 'assessments_assessment_type_id' });
    await queryInterface.addIndex('assessments', ['created_by'], { name: 'assessments_created_by' });
    await queryInterface.addIndex('course_instructors', ['course_id'], { name: 'course_instructors_course_id' });
    await queryInterface.addIndex('course_instructors', ['managed_by'], { name: 'course_instructors_managed_by' });
    await queryInterface.addIndex('grades', ['user_id', 'assessment_id'], { name: 'grades_user_id_assessment_id' });
    await queryInterface.addIndex('lecture_resources', ['lecture_id'], { name: 'lecture_resources_lecture_id' });
    await queryInterface.addIndex('lecture_resources', ['resources_id'], { name: 'lecture_resources_resources_id' });
    await queryInterface.addIndex('lectures', ['created_by'], { name: 'lectures_created_by' });
    await queryInterface.addIndex('lectures', ['module_id'], { name: 'lectures_module_id' });
    await queryInterface.addIndex('modules', ['course_id'], { name: 'modules_course_id' });
    await queryInterface.addIndex('modules', ['created_by'], { name: 'modules_created_by' });
    await queryInterface.addIndex('passwords', ['user_id'], { name: 'passwords_user_id' });
  },

  async down(queryInterface, Sequelize) {
    // Drop tables in FK-safe reverse order (Sequelize handles index removal automatically when table is dropped)
    await queryInterface.dropTable('ai_insights');
    await queryInterface.dropTable('user_batches');
    await queryInterface.dropTable('curriculums');
    await queryInterface.dropTable('batches');
    await queryInterface.dropTable('course_instructors');
    await queryInterface.dropTable('grades');
    await queryInterface.dropTable('lecture_assessments');
    await queryInterface.dropTable('assessment_screen_sessions');
    await queryInterface.dropTable('assessment_responses');
    await queryInterface.dropTable('assessment_questions');
    await queryInterface.dropTable('assessments');
    await queryInterface.dropTable('assessment_types');
    await queryInterface.dropTable('lecture_resources');
    await queryInterface.dropTable('resources');
    await queryInterface.dropTable('lectures');
    await queryInterface.dropTable('modules');
    await queryInterface.dropTable('courses');
    await queryInterface.dropTable('passwords');
    await queryInterface.dropTable('user_roles');
    await queryInterface.dropTable('role_permissions');
    await queryInterface.dropTable('permissions');
    await queryInterface.dropTable('roles');
    await queryInterface.dropTable('users');
  }
};