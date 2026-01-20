'use strict';

module.exports = (sequelize, DataTypes) => {
    const CalendarEvent = sequelize.define('CalendarEvent', {
        event_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        batch_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        curriculum_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        quarter_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        module_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        lecture_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        assessment_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: DataTypes.TEXT,
        event_type: {
            type: DataTypes.ENUM(
                'holiday',
                'module_session',
                'lecture',
                'assessments',  // Change to plural
                'events'
            ),
            allowNull: false,
        },
        event_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        start_time: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        end_time: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        is_all_day: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        is_recurring: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        recurrence_rule: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        created_by: {
            type: DataTypes.UUID,
            allowNull: true,
        }
    }, {
        tableName: 'calendar_events',
        underscored: true,
        timestamps: true,
        updatedAt: 'updated_at',
        createdAt: 'created_at',
    });

    CalendarEvent.associate = (models) => {
        CalendarEvent.belongsTo(models.Batch, { foreignKey: 'batch_id' });
        CalendarEvent.belongsTo(models.Curriculum, { foreignKey: 'curriculum_id' });
        CalendarEvent.belongsTo(models.Quarter, { foreignKey: 'quarter_id' });
        CalendarEvent.belongsTo(models.Module, { foreignKey: 'module_id' });
        CalendarEvent.belongsTo(models.Lecture, { foreignKey: 'lecture_id' });
        CalendarEvent.belongsTo(models.Assessment, { foreignKey: 'assessment_id' });
        CalendarEvent.belongsTo(models.User, { foreignKey: 'created_by', as: 'creator' });
        // CalendarEvent.belongsTo(models.Course, {
        //     foreignKey: 'course_id',
        //     as: 'course'
        // });
    };

    return CalendarEvent;
};