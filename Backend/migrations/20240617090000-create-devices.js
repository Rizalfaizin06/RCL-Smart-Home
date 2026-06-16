"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("devices", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "users",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            slot: {
                type: Sequelize.INTEGER,
                allowNull: false,
                comment: "Slot number on ESP32 (e.g. relay pin index)",
            },
            status: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            room_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "rooms",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
                comment: "Room this device belongs to (null = unassigned)",
            },
            type_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "device_types",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
                comment: "Device type (null = uncategorized)",
            },
            icon: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: "Icon name chosen on the frontend (overrides type's default icon)",
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("devices");
    },
};
