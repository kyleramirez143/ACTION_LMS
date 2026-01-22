module.exports = (sequelize, DataTypes) => {
    const Course = sequelize.define("Course", {
        course_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        batch_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "batches",
                key: "batch_id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
        },
        description: DataTypes.TEXT,
        is_published: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        }
    }, {
        tableName: "courses",
        timestamps: false,
        underscored: true,
    });

    Course.associate = function (models) {
        // Batch association
        Course.belongsTo(models.Batch, { foreignKey: "batch_id", as: "batch" });

        // Modules
        Course.hasMany(models.Module, { foreignKey: "course_id", as: "modules" });

        // Many-to-many CourseInstructor
        Course.hasMany(models.CourseInstructor, { foreignKey: "course_id", as: "course_instructors" });

        Course.hasMany(models.CalendarEvent, {
            foreignKey: 'course_id',
            as: 'events'
        });
    };

    return Course;
};
