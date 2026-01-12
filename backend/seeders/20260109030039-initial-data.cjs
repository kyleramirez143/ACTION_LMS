'use strict';
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize'); 

// =========================
// CONSTANTS: Roles
// =========================
const ADMIN_ROLE_ID = 'a0000000-0000-0000-0000-000000000001';
const TRAINER_ROLE_ID = 'a0000000-0000-0000-0000-000000000002';
const TRAINEE_ROLE_ID = 'a0000000-0000-0000-0000-000000000003';

const PERMISSIONS = [
  { id: 'b0000000-0000-0000-0000-000000000001', type_name: 'user:manage_all' },
  { id: 'b0000000-0000-0000-0000-000000000002', type_name: 'course:create_edit' },
  { id: 'b0000000-0000-0000-0000-000000000003', type_name: 'course:enroll_self' },
  { id: 'b0000000-0000-0000-0000-000000000004', type_name: 'course:view_content' },
  { id: 'b0000000-0000-0000-0000-000000000005', type_name: 'grade:submit_work' },
  { id: 'b0000000-0000-0000-0000-000000000006', type_name: 'grade:view_others' },
  { id: 'b0000000-0000-0000-0000-000000000007', type_name: 'grade:edit_others' },
];

const ROLES = [
  { id: ADMIN_ROLE_ID, name: 'Admin', description: 'Has full system control and management capabilities.' },
  { id: TRAINER_ROLE_ID, name: 'Trainer', description: 'Can create, manage, and grade courses/modules.' },
  { id: TRAINEE_ROLE_ID, name: 'Trainee', description: 'Can enroll in and complete courses/modules.' },
];

const ROLE_PERMISSIONS = [
  // Admin
  { role_id: ADMIN_ROLE_ID, permission_id: 'b0000000-0000-0000-0000-000000000001' },
  { role_id: ADMIN_ROLE_ID, permission_id: 'b0000000-0000-0000-0000-000000000002' },
  { role_id: ADMIN_ROLE_ID, permission_id: 'b0000000-0000-0000-0000-000000000003' },
  { role_id: ADMIN_ROLE_ID, permission_id: 'b0000000-0000-0000-0000-000000000004' },
  { role_id: ADMIN_ROLE_ID, permission_id: 'b0000000-0000-0000-0000-000000000005' },
  { role_id: ADMIN_ROLE_ID, permission_id: 'b0000000-0000-0000-0000-000000000006' },
  { role_id: ADMIN_ROLE_ID, permission_id: 'b0000000-0000-0000-0000-000000000007' },
  // Trainer
  { role_id: TRAINER_ROLE_ID, permission_id: 'b0000000-0000-0000-0000-000000000002' },
  { role_id: TRAINER_ROLE_ID, permission_id: 'b0000000-0000-0000-0000-000000000004' },
  { role_id: TRAINER_ROLE_ID, permission_id: 'b0000000-0000-0000-0000-000000000006' },
  { role_id: TRAINER_ROLE_ID, permission_id: 'b0000000-0000-0000-0000-000000000007' },
  // Trainee
  { role_id: TRAINEE_ROLE_ID, permission_id: 'b0000000-0000-0000-0000-000000000003' },
  { role_id: TRAINEE_ROLE_ID, permission_id: 'b0000000-0000-0000-0000-000000000004' },
  { role_id: TRAINEE_ROLE_ID, permission_id: 'b0000000-0000-0000-0000-000000000005' },
];

// =========================
// CONSTANTS: Users
// =========================
const ADMIN_USER_ID = 'c0000000-0000-0000-0000-000000000001';
const TRAINER_USER_ID = 'c0000000-0000-0000-0000-000000000002';
const TRAINEE_USER_ID = 'c0000000-0000-0000-0000-000000000003';

const ADMIN_EMAIL = 'adminb40@gmail.com';
const TRAINER_EMAIL = 'trainerb40@gmail.com';
const TRAINEE_EMAIL = 'traineeb40@gmail.com';

const ADMIN_PASSWORD = 'acTionb402025!';
const TRAINER_PASSWORD = 'acTionb402025!';
const TRAINEE_PASSWORD = 'acTionb402025!';

// =========================
// CONSTANTS: Assessment Types
// =========================
const ASSESSMENT_TYPES = [
  { name: 'Skill Check', weight: 10.00, passing_criteria: 70.00, description: 'Post-lecture assessments to check understanding of the lecture content.' },
  { name: 'Course-End Exam', weight: 20.00, passing_criteria: 70.00, description: 'Post-module assessments to evaluate knowledge of the module.' },
  { name: 'Mock Exam', weight: 25.00, passing_criteria: 75.00, description: 'Post-course assessments simulating the final exam.' },
  { name: 'Practice Exam', weight: 20.00, passing_criteria: 60.00, description: 'Practice exam for preparing for the mock exam.' },
  { name: 'Oral Exam', weight: 20.00, passing_criteria: 70.00, description: 'Nihongo oral exam to evaluate spoken Japanese skills.' },
  { name: 'Daily Quiz', weight: 20.00, passing_criteria: 70.00, description: 'Nihongo vocabulary, kanji, and grammar quizzes.' },
  { name: 'Homework', weight: 10.00, passing_criteria: 70.00, description: 'Kanji homework assignments.' },
  { name: 'Exercises', weight: 0.00, passing_criteria: 0.00, description: 'Pre-lecture exercises to prepare for the lecture.' },
  { name: 'Activity', weight: 0.00, passing_criteria: 0.00, description: 'During lecture activities or deliverables.' }
];

// =========================
// HELPER: Upsert Users
// =========================
async function upsertUsers(queryInterface, users, Sequelize) {
  const User = queryInterface.sequelize.define('User', {
    id: { type: Sequelize.UUID, primaryKey: true },
    first_name: Sequelize.STRING,
    last_name: Sequelize.STRING,
    email: Sequelize.STRING,
    is_active: Sequelize.BOOLEAN,
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  }, { tableName: 'users', timestamps: false });

  for (const user of users) {
    await User.upsert(user, { fields: Object.keys(user) });
  }
}

// =========================
// SEEDER
// =========================
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // --- Permissions / Roles ---
    const staticFields = (arr) => arr.map(item => ({ ...item, created_at: now }));
    await queryInterface.bulkInsert('permissions', staticFields(PERMISSIONS), {});
    await queryInterface.bulkInsert('roles', staticFields(ROLES), {});
    await queryInterface.bulkInsert('role_permissions', staticFields(ROLE_PERMISSIONS), {});

    // --- Users ---
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
      { id: ADMIN_USER_ID, first_name: 'System', last_name: 'Admin', email: ADMIN_EMAIL, is_active: true, created_at: now, updated_at: now },
      { id: TRAINER_USER_ID, first_name: 'System', last_name: 'Trainer', email: TRAINER_EMAIL, is_active: true, created_at: now, updated_at: now },
      { id: TRAINEE_USER_ID, first_name: 'System', last_name: 'Trainee', email: TRAINEE_EMAIL, is_active: true, created_at: now, updated_at: now },
    ];

    await upsertUsers(queryInterface, usersToUpsert, Sequelize);

    const passwordsToInsert = [
      { id: uuidv4(), password: adminHashedPassword, user_id: ADMIN_USER_ID, created_at: now, is_current: true },
      { id: uuidv4(), password: trainerHashedPassword, user_id: TRAINER_USER_ID, created_at: now, is_current: true },
      { id: uuidv4(), password: traineeHashedPassword, user_id: TRAINEE_USER_ID, created_at: now, is_current: true },
    ];

    const userRolesToInsert = [
      { user_id: ADMIN_USER_ID, role_id: ADMIN_ROLE_ID, created_at: now },
      { user_id: TRAINER_USER_ID, role_id: TRAINER_ROLE_ID, created_at: now },
      { user_id: TRAINEE_USER_ID, role_id: TRAINEE_ROLE_ID, created_at: now },
    ];

    const allUserIds = usersToUpsert.map(u => u.id);
    await queryInterface.bulkDelete('user_roles', { user_id: { [Op.in]: allUserIds } }, {});
    await queryInterface.bulkDelete('passwords', { user_id: { [Op.in]: allUserIds }, is_current: true }, {});
    await queryInterface.bulkInsert('passwords', passwordsToInsert, {});
    await queryInterface.bulkInsert('user_roles', userRolesToInsert, {});

    // --- Assessment Types ---
    const assessmentRecords = ASSESSMENT_TYPES.map(type => ({
      assessment_type_id: uuidv4(),
      name: type.name,
      weight: type.weight,
      passing_criteria: type.passing_criteria,
      description: type.description,
      created_at: now,
      updated_at: now
    }));

    await queryInterface.bulkInsert('assessment_types', assessmentRecords, {});
  },

  async down(queryInterface, Sequelize) {
    const allEmails = [ADMIN_EMAIL, TRAINER_EMAIL, TRAINEE_EMAIL];

    await queryInterface.bulkDelete('assessment_types', null, {});
    await queryInterface.bulkDelete('user_roles', { user_id: { [Op.in]: allEmails } }, {});
    await queryInterface.bulkDelete('passwords', { user_id: { [Op.in]: allEmails } }, {});
    await queryInterface.bulkDelete('users', { email: { [Op.in]: allEmails } }, {});
    await queryInterface.bulkDelete('role_permissions', null, {});
    await queryInterface.bulkDelete('roles', null, {});
    await queryInterface.bulkDelete('permissions', null, {});
  }
};


