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

    // --------------------------
    // COURSE STRUCTURE TABLES
    // --------------------------

    // COURSES
    await queryInterface.createTable('courses', {
      course_id: uuidColumn,
      title: { type: Sequelize.STRING(255), allowNull: false },
      image: { type: Sequelize.STRING(255) },
      description: { type: Sequelize.TEXT },
      is_published: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });

    // COURSE INSTRUCTORS
    await queryInterface.createTable('course_instructors', {
      course_id: { ...foreignKey('courses', 'course_id'), primaryKey: true },
      managed_by: { ...foreignKey('users', 'id', true, 'SET NULL'), primaryKey: true },
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });

    // MODULES
    await queryInterface.createTable('modules', {
      module_id: uuidColumn,
      course_id: foreignKey('courses', 'course_id'),
      title: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT },
      start_date: { type: Sequelize.DATEONLY, allowNull: false },
      end_date: { type: Sequelize.DATEONLY, allowNull: false },
      is_visible: { type: Sequelize.BOOLEAN, defaultValue: false }, 
      image: { type: Sequelize.STRING(255), allowNull: true }, 
      created_by: foreignKey('users', 'id', true, 'SET NULL'),
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });
    await queryInterface.addIndex('modules', ['course_id'], { name: 'idx_modules_course_id' });
    await queryInterface.addIndex('modules', ['created_by'], { name: 'idx_modules_created_by' });
    await queryInterface.addIndex('modules', ['start_date', 'end_date'], { name: 'idx_modules_date_range' });
    await queryInterface.addIndex('modules', ['is_visible'], { name: 'idx_modules_is_visible' });


    // LECTURES
    await queryInterface.createTable('lectures', {
      lecture_id: uuidColumn,
      module_id: foreignKey('modules', 'module_id'),
      created_by: foreignKey('users', 'id', true, 'SET NULL'),
      title: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.STRING(255), allowNull: true },
      start_date: { type: Sequelize.DATEONLY },
      end_date: { type: Sequelize.DATEONLY },
      is_visible: { type: Sequelize.BOOLEAN, defaultValue: false }, 
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });
    await queryInterface.addIndex('lectures', ['module_id'], { name: 'idx_lectures_module_id' });
    await queryInterface.addIndex('lectures', ['created_by'], { name: 'idx_lectures_created_by' });

    // RESOURCES
    await queryInterface.createTable('resources', {
      resource_id: uuidColumn,
      file_url: { type: Sequelize.TEXT, allowNull: false },
      display_name: { type: Sequelize.STRING(255) },
      content_type: { type: Sequelize.STRING(50) },
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });

    // LECTURE_RESOURCES
    await queryInterface.createTable('lecture_resources', {
      lecture_id: { ...foreignKey('lectures', 'lecture_id'), primaryKey: true },
      resource_id: { ...foreignKey('resources', 'resource_id', false, 'RESTRICT'), primaryKey: true },
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });

    // LECTURE SCHEDULES
    await queryInterface.createTable('lecture_schedules', {
      lecture_schedule_id: uuidColumn,
      lecture_id: foreignKey('lectures', 'lecture_id'),
      start_datetime: { type: Sequelize.DATE, allowNull: false },
      end_datetime: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop in reverse order to respect foreign key constraints
    await queryInterface.dropTable('lecture_schedules');
    await queryInterface.dropTable('lecture_resources');
    await queryInterface.dropTable('resources');
    await queryInterface.dropTable('lectures');
    await queryInterface.dropTable('modules');
    await queryInterface.dropTable('course_instructors');
    await queryInterface.dropTable('courses');
  },
};
