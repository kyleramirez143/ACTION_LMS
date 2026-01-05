module.exports = (sequelize, DataTypes) => {
    const UserBatch = sequelize.define("UserBatch", {
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'users', key: 'id' }
        },
        batch_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'batches', key: 'batch_id' }
        },
        assigned_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: "user_batches",
        timestamps: false
    });

    return UserBatch;
};
