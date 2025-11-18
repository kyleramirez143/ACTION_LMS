'use strict';

// UUIDs provided in the prompt for consistency
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
  { role_id: ADMIN_ROLE_ID, permission_id: 'b0000000-0000-0000-0000-000000000001' }, // user:manage_all
  { role_id: ADMIN_ROLE_ID, permission_id: 'b0000000-0000-0000-0000-000000000002' }, // course:create_edit
  { role_id: ADMIN_ROLE_ID, permission_id: 'b0000000-0000-0000-0000-000000000003' }, // course:enroll_self
  { role_id: ADMIN_ROLE_ID, permission_id: 'b0000000-0000-0000-0000-000000000004' }, // course:view_content
  { role_id: ADMIN_ROLE_ID, permission_id: 'b0000000-0000-0000-0000-000000000005' }, // grade:submit_work
  { role_id: ADMIN_ROLE_ID, permission_id: 'b0000000-0000-0000-0000-000000000006' }, // grade:view_others
  { role_id: ADMIN_ROLE_ID, permission_id: 'b0000000-0000-0000-0000-000000000007' }, // grade:edit_others

  // Trainer
  { role_id: TRAINER_ROLE_ID, permission_id: 'b0000000-0000-0000-0000-000000000002' }, // course:create_edit
  { role_id: TRAINER_ROLE_ID, permission_id: 'b0000000-0000-0000-0000-000000000004' }, // course:view_content
  { role_id: TRAINER_ROLE_ID, permission_id: 'b0000000-0000-0000-0000-000000000006' }, // grade:view_others
  { role_id: TRAINER_ROLE_ID, permission_id: 'b0000000-0000-0000-0000-000000000007' }, // grade:edit_others

  // Trainee
  { role_id: TRAINEE_ROLE_ID, permission_id: 'b0000000-0000-0000-0000-000000000003' }, // course:enroll_self
  { role_id: TRAINEE_ROLE_ID, permission_id: 'b0000000-0000-0000-0000-000000000004' }, // course:view_content
  { role_id: TRAINEE_ROLE_ID, permission_id: 'b0000000-0000-0000-0000-000000000005' }, // grade:submit_work
];


module.exports = {
  async up(queryInterface, Sequelize) {

    // For tables that have 'update_at' column
    // const commonFields = (arr) => arr.map(item => ({
    //   ...item,
    //   created_at: new Date(),
    //   updated_at: new Date(), // Using updated_at for tables that have it by default
    // }));

    // For tables that only have 'created_at' (like roles, permissions, user_roles, role_permissions)
    const staticFields = (arr) => arr.map(item => ({
      ...item,
      created_at: new Date(),
    }));

    // Insert Permissions first
    await queryInterface.bulkInsert('permissions', staticFields(PERMISSIONS), {});
    // Insert Roles
    await queryInterface.bulkInsert('roles', staticFields(ROLES), {});
    // Insert Role-Permission relations
    await queryInterface.bulkInsert('role_permissions', staticFields(ROLE_PERMISSIONS), {});
  },

  async down(queryInterface, Sequelize) {
    // Delete data in reverse order of insertion (or all at once for simplicity)
    await queryInterface.bulkDelete('role_permissions', null, {});
    await queryInterface.bulkDelete('roles', null, {});
    await queryInterface.bulkDelete('permissions', null, {});
  }
};