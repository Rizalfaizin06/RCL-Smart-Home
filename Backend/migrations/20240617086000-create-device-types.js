"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("device_types", {
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
                comment: "Display label, e.g. Smart Light, Humidifier",
            },
            icon: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "generic",
                comment: "Default icon name for this type (frontend icon list)",
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

        await queryInterface.addIndex("device_types", ["user_id"]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("device_types");
    },
};
