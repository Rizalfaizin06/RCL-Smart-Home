"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Device extends Model {
        static associate(models) {
            Device.belongsTo(models.User, {
                foreignKey: "user_id",
                as: "user",
            });
            Device.belongsTo(models.Room, {
                foreignKey: "room_id",
                as: "room",
            });
            Device.belongsTo(models.DeviceType, {
                foreignKey: "type_id",
                as: "type",
            });
            Device.hasMany(models.Schedule, {
                foreignKey: "device_id",
                as: "schedules",
            });
        }
    }
    Device.init(
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
            slot: {
                type: DataTypes.INTEGER,
                allowNull: false,
                comment: "Slot number on ESP32 (e.g. relay pin index)",
            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            room_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            type_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            icon: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: "Device",
            tableName: "devices",
            underscored: true,
        }
    );
    return Device;
};
