'use strict';
const bcrypt = require('bcrypt'); // Make sure you've installed bcrypt
const { v4: uuidv4 } = require('uuid');

const ADMIN_ROLE_ID = 'a0000000-0000-0000-0000-000000000001'; // From the roles seeder

// Use a known ID for the admin user for easier testing
const ADMIN_USER_ID = 'c0000000-0000-0000-0000-000000000001'; 
const ADMIN_EMAIL = 'adminb40@gmail.com';
const ADMIN_PASSWORD = 'acTionb402025mabUhay!'; // !!! Change this in a real environment

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // 1. Create the Admin User
    await queryInterface.bulkInsert('users', [{
      id: ADMIN_USER_ID,
      first_name: 'System',
      last_name: 'Admin',
      email: ADMIN_EMAIL,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    }], {});

    // 2. Create the Password record
    await queryInterface.bulkInsert('passwords', [{
      id: uuidv4(), // Use a new UUID for the password record
      password: hashedPassword,
      user_id: ADMIN_USER_ID,
      created_at: new Date(),
      is_current: true,
    }], {});

    // 3. Assign the Admin Role to the User
    await queryInterface.bulkInsert('user_roles', [{
      user_id: ADMIN_USER_ID,
      role_id: ADMIN_ROLE_ID,
      created_at: new Date(),
    }], {});
  },

  async down(queryInterface, Sequelize) {
    // Delete Admin User and associated records (cascading deletes handle password and roles)
    await queryInterface.bulkDelete('users', { email: ADMIN_EMAIL }, {});
    // Note: The CASCADE on delete from users handles the password and user_roles deletion.
  }
};