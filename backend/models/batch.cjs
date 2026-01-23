// models/batch.cjs
module.exports = (sequelize, DataTypes) => {
    const Batch = sequelize.define('Batch', {
        batch_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        location: { type: DataTypes.STRING(50) },
        start_date: { type: DataTypes.DATEONLY },
        end_date: { type: DataTypes.DATEONLY },
    }, {
        tableName: 'batches',
        timestamps: true, // This maps to created_at and updated_at
        underscored: true,


        indexes: [
            {
                unique: true,
                fields: ['name', 'location'],
            },
        ],
    });


    Batch.associate = function (models) {
        Batch.belongsToMany(models.User, {
            through: models.UserBatch,
            foreignKey: 'batch_id',
            otherKey: 'user_id',
            as: 'users'
        });


        // Inside Batch.associate
        Batch.hasOne(models.Curriculum, {
            foreignKey: 'batch_id',
            as: 'curriculum'
        });


        Batch.associate = function (models) {
        Batch.belongsToMany(models.User, {
        through: models.UserBatch,
        foreignKey: "batch_id",
        otherKey: "user_id",
        as: "users"
        });
    };
    };


    return Batch;
};
