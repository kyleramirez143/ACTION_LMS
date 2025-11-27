module.exports = (sequelize, DataTypes) => {
    const CourseInstructor = sequelize.define("CourseInstructor", {
        course_id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },
        managed_by: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: "course_instructors",
        timestamps: false
    });

    CourseInstructor.associate = function (models) {
        CourseInstructor.belongsTo(models.User, { foreignKey: "managed_by", as: "instructor" });
    };

    return CourseInstructor;
};
