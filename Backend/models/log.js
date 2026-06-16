"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Log extends Model {
        static associate(models) {
            Log.belongsTo(models.User, {
                foreignKey: "user_id",
                as: "user",
            });
        }
    }
    Log.init(
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            device_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            action: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            metadata: {
                type: DataTypes.JSON,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: "Log",
            tableName: "logs",
            underscored: true,
        }
    );
    return Log;
};
