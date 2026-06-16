"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class DeviceType extends Model {
        static associate(models) {
            DeviceType.belongsTo(models.User, {
                foreignKey: "user_id",
                as: "user",
            });
            DeviceType.hasMany(models.Device, {
                foreignKey: "type_id",
                as: "devices",
            });
        }
    }
    DeviceType.init(
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            icon: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: "generic",
            },
        },
        {
            sequelize,
            modelName: "DeviceType",
            tableName: "device_types",
            underscored: true,
        }
    );
    return DeviceType;
};
