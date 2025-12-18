module.exports = (sequelize, DataTypes) => {
    const UserBatch = sequelize.define("UserBatch", {
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true
        },
        batch_id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true
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
