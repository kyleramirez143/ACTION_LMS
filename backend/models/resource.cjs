module.exports = (sequelize, DataTypes) => {
    const Resource = sequelize.define('Resource', {
        resource_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
        },
        file_url: {
            type: DataTypes.STRING(500),
            allowNull: false
        },
        is_visible: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'resources',
        timestamps: false,
        underscored: true
    });

    Resource.associate = (models) => {
        Resource.hasMany(models.LectureResource, { foreignKey: 'resources_id', as: 'lectureResources' });

        Resource.belongsToMany(models.Lecture, {
            through: models.LectureResource,
            foreignKey: 'resources_id',
            otherKey: 'lecture_id',
            as: 'lectures'
        });
    };

    return Resource;
};
