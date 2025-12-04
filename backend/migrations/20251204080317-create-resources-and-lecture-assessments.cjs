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

    // 1. Remove columns from lectures
    await queryInterface.removeColumn('lectures', 'content_url');
    await queryInterface.removeColumn('lectures', 'content_type');

    // 2. Create resources table
    await queryInterface.createTable('resources', {
      resource_id: uuidColumn,
      file_url: { type: Sequelize.TEXT, allowNull: false },
      content_type: { type: Sequelize.STRING(50) },
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });

    // 3. Create lecture_resources table
    await queryInterface.createTable('lecture_resources', {
      lecture_id: foreignKey('lectures', 'lecture_id'),
      resource_id: foreignKey('resources', 'resource_id'),
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });

    // Add composite primary key
    await queryInterface.sequelize.query(`
      ALTER TABLE lecture_resources
      ADD PRIMARY KEY (lecture_id, resource_id);
    `);

    // Add indexes
    await queryInterface.addIndex('lecture_resources', ['lecture_id']);
    await queryInterface.addIndex('lecture_resources', ['resource_id']);

    // 4. Create lectures_assessments table
    await queryInterface.createTable('lectures_assessments', {
      lecture_id: foreignKey('lectures', 'lecture_id'),
      assessment_id: foreignKey('assessments', 'assessment_id'),
      order: { type: Sequelize.INTEGER },
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });

    // Add composite primary key
    await queryInterface.sequelize.query(`
      ALTER TABLE lectures_assessments
      ADD PRIMARY KEY (lecture_id, assessment_id);
    `);

    // Add indexes
    await queryInterface.addIndex('lectures_assessments', ['lecture_id'], { name: 'idx_lectures_assessments_lecture_id' });
    await queryInterface.addIndex('lectures_assessments', ['assessment_id'], { name: 'idx_lectures_assessments_assessment_id' });
  },

  async down(queryInterface, Sequelize) {
    // Drop tables
    await queryInterface.dropTable('lectures_assessments');
    await queryInterface.dropTable('lecture_resources');
    await queryInterface.dropTable('resources');

    // Restore columns in lectures
    await queryInterface.addColumn('lectures', 'content_url', { type: Sequelize.TEXT });
    await queryInterface.addColumn('lectures', 'content_type', { type: Sequelize.STRING(50) });
  }
};
