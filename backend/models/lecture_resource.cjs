module.exports = (sequelize, DataTypes) => {
    const LectureResource = sequelize.define('LectureResource', {
        lecture_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false
        },
        resources_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'lecture_resources',
        timestamps: false,
        underscored: true
    });

    LectureResource.associate = (models) => {
        LectureResource.belongsTo(models.Lecture, { foreignKey: 'lecture_id', as: 'lecture' });
        LectureResource.belongsTo(models.Resource, { foreignKey: 'resources_id', as: 'resource' });
    };

    return LectureResource;
};
