"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            User.hasMany(models.Device, {
                foreignKey: "user_id",
                as: "devices",
            });
            User.hasMany(models.Room, {
                foreignKey: "user_id",
                as: "rooms",
            });
            User.hasMany(models.DeviceType, {
                foreignKey: "user_id",
                as: "deviceTypes",
            });
            User.hasMany(models.Schedule, {
                foreignKey: "user_id",
                as: "schedules",
            });
            User.hasMany(models.Log, {
                foreignKey: "user_id",
                as: "logs",
            });
        }
    }
    User.init(
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            avatar_url: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            role: {
                type: DataTypes.ENUM("user", "admin"),
                allowNull: false,
                defaultValue: "user",
            },
        },
        {
            sequelize,
            modelName: "User",
            tableName: "users",
            underscored: true,
        }
    );
    return User;
};
