'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Helpers
    const standardTimestamp = {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
      allowNull: false,
    };

    const foreignKey = (references, key, allowNull = false, onDelete = 'CASCADE') => ({
      type: Sequelize.UUID,
      allowNull,
      references: { model: references, key },
      onUpdate: 'CASCADE',
      onDelete,
    });

    // Create associative table
    await queryInterface.createTable('lectures_assessments', {
      lecture_id: foreignKey('lectures', 'lecture_id'),
      assessment_id: foreignKey('assessments', 'assessment_id'),
      order: { type: Sequelize.INTEGER, allowNull: true }, // optional for ordering
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });

    // Add indexes
    await queryInterface.addIndex('lectures_assessments', ['lecture_id']);
    await queryInterface.addIndex('lectures_assessments', ['assessment_id']);
  },

  async down(queryInterface, Sequelize) {
    // Drop table
    await queryInterface.dropTable('lectures_assessments');
  },
};
