module.exports = (sequelize, DataTypes) => {
    const Lecture = sequelize.define("Lecture", {
        lecture_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
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
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true
        },

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

        Lecture.belongsToMany(models.Resource, {
            through: 'lecture_resources',
            foreignKey: 'lecture_id',
            otherKey: 'resources_id',
            as: 'resources'
        });

        Lecture.belongsToMany(models.Assessment, {
            through: 'lecture_assessments',
            foreignKey: 'lecture_id',
            otherKey: 'assessment_id',
            as: 'assessments',
        });
    };

    return Lecture;
};
