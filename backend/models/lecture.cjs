module.exports = (sequelize, DataTypes) => {
    const Lecture = sequelize.define("Lecture", {
        lecture_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        course_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        module_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        created_by: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        content_type: DataTypes.STRING(50),
        content_url: DataTypes.STRING(500),
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        }
    }, {
        tableName: "lectures",
        timestamps: false,
        underscored: true,
    });

    Lecture.associate = function (models) {
        Lecture.belongsTo(models.Module, {
            foreignKey: "module_id",
            as: "module",
        });

        Lecture.belongsTo(models.User, {
            foreignKey: "created_by",
            as: "creator",
        });
    };

    return Lecture;
};
