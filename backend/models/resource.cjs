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
        },
        display_name: { type: DataTypes.STRING(255) },
        content_type: { type: DataTypes.STRING(50) },
    }, {
        tableName: 'resources',
        timestamps: false,
        underscored: true
    });

    Resource.associate = (models) => {
        if (!models.LectureResource) return; // avoids crash

        Resource.hasMany(models.LectureResource, {
            foreignKey: "resource_id",
            as: "lectureResources"
        });

        Resource.belongsToMany(models.Lecture, {
            through: models.LectureResource,
            foreignKey: "resource_id",
            otherKey: "lecture_id",
            as: "lectures"
        });
    };

    return Resource;
};