'use strict';
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize'); // Import Op for bulkDelete if needed

// --- CONSTANTS ---
const ADMIN_ROLE_ID = 'a0000000-0000-0000-0000-000000000001';
const TRAINER_ROLE_ID = 'a0000000-0000-0000-0000-000000000002';
const TRAINEE_ROLE_ID = 'a0000000-0000-0000-0000-000000000003';

const ADMIN_USER_ID = 'c0000000-0000-0000-0000-000000000001';
const ADMIN_EMAIL = 'adminb40@gmail.com';
const ADMIN_PASSWORD = 'acTionb402025mabUhay!';

const TRAINER_USER_ID = 'c0000000-0000-0000-0000-000000000002';
const TRAINER_EMAIL = 'trainerb40@gmail.com';
const TRAINER_PASSWORD = 'acTionb402025!';

const TRAINEE_USER_ID = 'c0000000-0000-0000-0000-000000000003';
const TRAINEE_EMAIL = 'traineeb40@gmail.com';
const TRAINEE_PASSWORD = 'acTionb402025!';

// --- HELPER FUNCTION FOR UPSERT (Update or Insert) ---
// This function prevents primary key and unique constraint conflicts.
async function upsertUsers(queryInterface, users, Sequelize) {
  const User = queryInterface.sequelize.define('User', {
    id: { type: Sequelize.UUID, primaryKey: true },
    first_name: Sequelize.STRING,
    last_name: Sequelize.STRING,
    email: Sequelize.STRING,
    is_active: Sequelize.BOOLEAN,
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  }, {
    tableName: 'users',
    timestamps: false,
  });

  for (const user of users) {
    await User.upsert(user, {
      // Upsert will use the primary key ('id') to check for existence
      fields: Object.keys(user),
    });
  }
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // 1. Prepare User Data (with Hashed Passwords)
    const [
      adminHashedPassword,
      trainerHashedPassword,
      traineeHashedPassword
    ] = await Promise.all([
      bcrypt.hash(ADMIN_PASSWORD, 10),
      bcrypt.hash(TRAINER_PASSWORD, 10),
      bcrypt.hash(TRAINEE_PASSWORD, 10),
    ]);

    const usersToUpsert = [
      {
        id: ADMIN_USER_ID,
        first_name: 'System',
        last_name: 'Admin',
        email: ADMIN_EMAIL,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: TRAINER_USER_ID,
        first_name: 'System',
        last_name: 'Trainer',
        email: TRAINER_EMAIL,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: TRAINEE_USER_ID,
        first_name: 'System',
        last_name: 'Trainee',
        email: TRAINEE_EMAIL,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ];

    const passwordsToInsert = [
      {
        id: uuidv4(),
        password: adminHashedPassword,
        user_id: ADMIN_USER_ID,
        created_at: now,
        is_current: true,
      },
      {
        id: uuidv4(),
        password: trainerHashedPassword,
        user_id: TRAINER_USER_ID,
        created_at: now,
        is_current: true,
      },
      {
        id: uuidv4(),
        password: traineeHashedPassword,
        user_id: TRAINEE_USER_ID,
        created_at: now,
        is_current: true,
      },
    ];

    const userRolesToInsert = [
      { user_id: ADMIN_USER_ID, role_id: ADMIN_ROLE_ID, created_at: now },
      { user_id: TRAINER_USER_ID, role_id: TRAINER_ROLE_ID, created_at: now },
      { user_id: TRAINEE_USER_ID, role_id: TRAINEE_ROLE_ID, created_at: now },
    ];

    // 2. Insert/Update Records
    // Use upsert to safely create or update the users table
    await upsertUsers(queryInterface, usersToUpsert, Sequelize);

    // Bulk insert unique records (Passwords and User Roles)
    // Note: This assumes that a new password record is safe to insert,
    // which is true if your database doesn't enforce uniqueness on password or user_id for non-current passwords.
    // However, since this is a clean seed, we'll first delete any existing roles/passwords and re-insert for simplicity.
    const allUserIds = usersToUpsert.map(u => u.id);
    
    // Safety check: Delete existing roles and current passwords for these users
    await queryInterface.bulkDelete('user_roles', { user_id: { [Op.in]: allUserIds } }, {});
    await queryInterface.bulkDelete('passwords', { user_id: { [Op.in]: allUserIds }, is_current: true }, {});
    
    // Now insert the new, consolidated data
    await queryInterface.bulkInsert('passwords', passwordsToInsert, {});
    await queryInterface.bulkInsert('user_roles', userRolesToInsert, {});
  },

  async down(queryInterface, Sequelize) {
    const allEmails = [ADMIN_EMAIL, TRAINER_EMAIL, TRAINEE_EMAIL];

    // Delete all users created by this seeder
    await queryInterface.bulkDelete('users', { email: { [Op.in]: allEmails } }, {});
    // Cascading deletes should handle the associated passwords and user_roles records.
  }
};