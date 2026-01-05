module.exports = (sequelize, DataTypes) => {
    const Module = sequelize.define("Module", {
        module_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        course_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        description: DataTypes.TEXT,
        image: DataTypes.STRING(255),
        created_by: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        is_visible: {
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
        tableName: "modules",
        timestamps: false,
        underscored: true,
    });

    Module.associate = function (models) {
        Module.belongsTo(models.Course, {
            foreignKey: "course_id",
            as: "course",
        });

        Module.belongsTo(models.User, {
            foreignKey: "created_by",
            as: "creator",
        });

        Module.hasMany(models.Lecture, {
            foreignKey: "module_id",
            as: "lectures",
        });
    };

    return Module;
};
