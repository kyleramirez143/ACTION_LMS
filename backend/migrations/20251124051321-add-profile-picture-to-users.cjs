'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const standardTimestamp = { 
      type: Sequelize.DATE, 
      defaultValue: Sequelize.literal('NOW()'),
      allowNull: false,
    };

    // Add a new column `profile_picture` to users table
    await queryInterface.addColumn('users', 'profile_picture', {
      type: Sequelize.STRING(255),
      allowNull: true, // optional field
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the column if rolling back
    await queryInterface.removeColumn('users', 'profile_picture');
  }
};