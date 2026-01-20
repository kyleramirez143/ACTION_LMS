module.exports = (sequelize, DataTypes) => {
    const AssessmentType = sequelize.define(
        "AssessmentType",
        {
            assessment_type_id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4, // Sequelize generates a UUID
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true
            },
            description: {
                type: DataTypes.TEXT
            },
            weight: {
                type: DataTypes.DECIMAL(5, 2),
                allowNull: false,
                defaultValue: 0.00
            },
            passing_criteria: {
                type: DataTypes.DECIMAL(5, 2),
                allowNull: false,
                defaultValue: 70.00
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            }
        },
        {
            tableName: "assessment_types",
            timestamps: false
        }
    );

    return AssessmentType;
};
