"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("logs", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "users",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
                comment: "User that triggered the event (null for system events)",
            },
            device_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                comment: "Related device id, if any (no FK so logs survive device deletion)",
            },
            action: {
                type: Sequelize.STRING,
                allowNull: false,
                comment: "Event type, e.g. auth.login, device.create, device.status",
            },
            description: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: "Human-readable summary of the event",
            },
            metadata: {
                type: Sequelize.JSON,
                allowNull: true,
                comment: "Arbitrary structured context for the event",
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

        await queryInterface.addIndex("logs", ["user_id"]);
        await queryInterface.addIndex("logs", ["action"]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("logs");
    },
};
