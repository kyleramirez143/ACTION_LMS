module.exports = (sequelize, DataTypes) => {
    const Batch = sequelize.define('Batch', {
        batch_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: DataTypes.TEXT,
        start_date: DataTypes.DATEONLY,
        end_date: DataTypes.DATEONLY
    }, {
        tableName: 'batches',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return Batch;
};
