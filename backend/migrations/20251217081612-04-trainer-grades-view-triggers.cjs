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

    // EVENT TYPE ENUM
    await queryInterface.sequelize.query(`
      CREATE TYPE event_type_enum AS ENUM (
        'holiday',
        'module_session',
        'lecture',
        'assessments',
        'events'
      );
    `);


    // --------------------------
    // CALENDAR EVENTS
    // --------------------------
    await queryInterface.createTable('calendar_events', {
      event_id: uuidColumn,

      batch_id: foreignKey('batches', 'batch_id'),
      curriculum_id: foreignKey('curriculums', 'curriculum_id', true),
      quarter_id: foreignKey('quarters', 'quarter_id', true, 'SET NULL'),
      module_id: foreignKey('modules', 'module_id'),
      lecture_id: foreignKey('lectures', 'lecture_id', true, 'SET NULL'),
      assessment_id: foreignKey('assessments', 'assessment_id', true, 'SET NULL'),

      title: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT },

      event_type: {
        type: 'event_type_enum',
        allowNull: false,
      },

      start_time: {
        type: Sequelize.DATE, // maps to TIMESTAMPTZ in Postgres
        allowNull: false,
      },
      end_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      is_all_day: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      is_recurring: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      recurrence_rule: { type: Sequelize.JSON },

      created_by: foreignKey('users', 'id', true, 'SET NULL'),
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });

    await queryInterface.addConstraint('calendar_events', {
      fields: ['end_time', 'start_time'],
      type: 'check',
      name: 'check_end_after_start',
      where: {
        end_time: { [Sequelize.Op.gt]: Sequelize.col('start_time') }
      }
    });

    await queryInterface.addIndex(
      'calendar_events',
      ['batch_id', 'start_time', 'end_time'],
      { name: 'idx_calendar_events_batch_time' }
    );

    await queryInterface.addIndex(
      'calendar_events',
      ['module_id'],
      { name: 'idx_calendar_events_module' }
    );

    await queryInterface.addIndex(
      'calendar_events',
      ['event_type'],
      { name: 'idx_calendar_events_type' }
    );

    await queryInterface.addIndex(
      'calendar_events',
      ['is_recurring'],
      { name: 'idx_calendar_events_recurring' }
    );

    await queryInterface.sequelize.query(`
      ALTER TABLE calendar_events
      ADD CONSTRAINT no_batch_overlap
      EXCLUDE USING GIST (
        batch_id WITH =,
        tstzrange(start_time, end_time) WITH &&
      );
    `);


    // --------------------------
    // LECTURES ↔ ASSESSMENTS
    // --------------------------
    await queryInterface.createTable('lectures_assessments', {
      lecture_id: { ...foreignKey('lectures', 'lecture_id'), primaryKey: true },
      assessment_id: { ...foreignKey('assessments', 'assessment_id'), primaryKey: true },
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });

    // --------------------------
    // QUARTER EVALUATIONS
    // --------------------------
    await queryInterface.createTable('quarter_evaluations', {
      evaluation_id: uuidColumn,
      user_id: foreignKey('users', 'id'),
      quarter_id: foreignKey('quarters', 'quarter_id'),
      overall_score: { type: Sequelize.DECIMAL(5, 2), allowNull: false },
      passed: { type: Sequelize.BOOLEAN, allowNull: false },
      calculated_at: standardTimestamp,
      created_at: standardTimestamp,
      updated_at: standardTimestamp,
    });

    // --------------------------
    // UPDATED_AT TRIGGER
    // --------------------------
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryInterface.sequelize.query(`
      CREATE TRIGGER trg_calendar_events_updated
      BEFORE UPDATE ON calendar_events
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
    `);


    // --------------------------
    // TRAINER GRADES VIEW
    // --------------------------
    await queryInterface.sequelize.query(`
      CREATE VIEW trainer_grades_view AS
      SELECT
          u.id AS trainee_id,
          u.first_name || ' ' || u.last_name AS trainee_name,
          b.batch_id,
          b.name AS batch_name,
          a.assessment_id,
          a.title AS assessment_title,
          g.grade_id,
          g.score AS raw_score,
          g.weight AS assessment_weight,
          g.remarks,
          g.created_at AS grade_date
      FROM grades g
      JOIN users u ON g.user_id = u.id
      JOIN user_batches ub ON u.id = ub.user_id
      JOIN batches b ON ub.batch_id = b.batch_id
      JOIN assessments a ON g.assessment_id = a.assessment_id
      ORDER BY b.name, trainee_name, grade_date;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP VIEW IF EXISTS trainer_grades_view`);
    await queryInterface.dropTable('quarter_evaluations');
    await queryInterface.dropTable('lectures_assessments');
    await queryInterface.dropTable('calendar_events');
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS event_type_enum`);
  },
};
