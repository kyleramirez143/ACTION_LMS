'use strict';
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

// =========================
// CONSTANTS: IDs from previous seeders
// =========================
const BATCH_40_ID = 'd0000000-0000-0000-0000-000000000001';
const TRAINER_1_ID = 'c2000000-0000-0000-0000-000000000001'; // First trainer from batch40-users

// =========================
// CONSTANTS: Demo Content IDs
// =========================
const DEMO_COURSE_ID = 'ab000000-0000-0000-0000-000000000001';
const DEMO_MODULE_ID = 'cd000000-0000-0000-0000-000000000001';
const DEMO_LECTURE_ID = 'fa000000-0000-0000-0000-000000000001';

// =========================
// SEEDER
// =========================
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // --- DEMO COURSE ---
    await queryInterface.bulkInsert('courses', [
      {
        course_id: DEMO_COURSE_ID,
        batch_id: BATCH_40_ID,
        title: 'Demo Course - Computer Systems Fundamentals',
        description: 'This is a sample course for reference purposes. It demonstrates the structure of a typical course in the ACTION LMS. This course covers the fundamentals of computer systems including hardware, software, and basic computing concepts.',
        image: null,
        is_published: true, 
        created_at: now,
        updated_at: now,
      }
    ]);

    // --- COURSE INSTRUCTOR (Assign trainer1 to demo course) ---
    await queryInterface.bulkInsert('course_instructors', [
      {
        course_id: DEMO_COURSE_ID,
        managed_by: TRAINER_1_ID,
        created_at: now,
        updated_at: now,
      }
    ]);

    // --- DEMO MODULE ---
    await queryInterface.bulkInsert('modules', [
      {
        module_id: DEMO_MODULE_ID,
        course_id: DEMO_COURSE_ID,
        title: 'Demo Module - Introduction to Computing',
        description: 'This is a sample module for reference purposes. It demonstrates how modules are structured within a course. This module introduces basic computing concepts and terminology.',
        start_date: '2025-07-28',
        end_date: '2025-08-04',
        is_visible: false, // Hidden - for reference only
        image: null,
        created_by: TRAINER_1_ID,
        created_at: now,
        updated_at: now,
      }
    ]);

    // --- DEMO LECTURE ---
    await queryInterface.bulkInsert('lectures', [
      {
        lecture_id: DEMO_LECTURE_ID,
        module_id: DEMO_MODULE_ID,
        created_by: TRAINER_1_ID,
        title: 'Demo Lecture - Getting Started with Computer Systems',
        description: 'This is a sample lecture for reference purposes. It demonstrates the structure of a lecture within a module. This lecture covers the basics of computer system architecture.',
        start_date: '2025-07-28',
        end_date: '2025-07-29',
        is_visible: false, // Hidden - for reference only
        created_at: now,
        updated_at: now,
      }
    ]);

    console.log('✅ Demo content seeded successfully!');
    console.log('   - 1 Demo Course (unpublished)');
    console.log('   - 1 Demo Module (hidden)');
    console.log('   - 1 Demo Lecture (hidden)');
  },

  async down(queryInterface, Sequelize) {
    // Delete in reverse order to respect foreign key constraints
    
    // Delete lecture
    await queryInterface.bulkDelete('lectures', {
      lecture_id: DEMO_LECTURE_ID
    });

    // Delete module
    await queryInterface.bulkDelete('modules', {
      module_id: DEMO_MODULE_ID
    });

    // Delete course instructor
    await queryInterface.bulkDelete('course_instructors', {
      course_id: DEMO_COURSE_ID
    });

    // Delete course
    await queryInterface.bulkDelete('courses', {
      course_id: DEMO_COURSE_ID
    });

    console.log('✅ Demo content removed successfully!');
  }
};