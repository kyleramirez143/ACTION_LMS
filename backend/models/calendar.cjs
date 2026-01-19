'use strict';

module.exports = (sequelize, DataTypes) => {
    const CalendarEvent = sequelize.define('CalendarEvent', {
        event_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        batch_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: DataTypes.TEXT,
        event_type: {
            type: DataTypes.ENUM('module_session', 'lecture', 'quiz', 'exam', 'holiday', 'break'),
            allowNull: false
        },
        start_time: {
            type: DataTypes.DATE,
            allowNull: false
        },
        end_time: {
            type: DataTypes.DATE,
            allowNull: false
        },
        is_all_day: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'calendar_events', // Matches your SQL table name
        underscored: true,            // Matches start_time, end_time column format
        timestamps: true              // Handles created_at, updated_at
    });

    CalendarEvent.associate = (models) => {
        // Define associations here, e.g.:
        // CalendarEvent.belongsTo(models.Batch, { foreignKey: 'batch_id' });
    };

    return CalendarEvent;
};