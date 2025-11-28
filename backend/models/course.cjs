module.exports = (sequelize, DataTypes) => {
    const Course = sequelize.define("Course", {
        course_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING(255),
            allowNull: false,
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
        Course.hasMany(models.Module, {
            foreignKey: "course_id",
            as: "modules",
        });

        Course.hasMany(models.CourseInstructor, { foreignKey: "course_id", as: "course_instructors" });
    };

    return Course;
};
