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

    // Remove columns from lectures
    await queryInterface.removeColumn('lectures', 'content_url');
    await queryInterface.removeColumn('lectures', 'content_type');

    // Create resources table
    await queryInterface.createTable('resources', {
      resource_id: uuidColumn,
      file_url: { type: Sequelize.TEXT, allowNull: false },
      content_type: { type: Sequelize.STRING(50) },
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });

    // Create lecture_resources table (many-to-many)
    await queryInterface.createTable('lecture_resources', {
      lecture_id: foreignKey('lectures', 'lecture_id'),
      resource_id: foreignKey('resources', 'resource_id'),
      created_at: standardTimestamp,
      primaryKey: false, // We’ll set composite PK below
    });

    // Add composite primary key
    await queryInterface.sequelize.query(`
      ALTER TABLE lecture_resources
      ADD PRIMARY KEY (lecture_id, resource_id);
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('lecture_resources');
    await queryInterface.dropTable('resources');
    await queryInterface.addColumn('lectures', 'content_url', { type: Sequelize.TEXT });
    await queryInterface.addColumn('lectures', 'content_type', { type: Sequelize.STRING(50) });
  }
};
