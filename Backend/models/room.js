"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Room extends Model {
        static associate(models) {
            Room.belongsTo(models.User, {
                foreignKey: "user_id",
                as: "user",
            });
            Room.hasMany(models.Device, {
                foreignKey: "room_id",
                as: "devices",
            });
        }
    }
    Room.init(
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
                defaultValue: "living",
            },
        },
        {
            sequelize,
            modelName: "Room",
            tableName: "rooms",
            underscored: true,
        }
    );
    return Room;
};
