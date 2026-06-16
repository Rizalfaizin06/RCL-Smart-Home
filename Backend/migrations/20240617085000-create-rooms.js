"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("rooms", {
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
            icon: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "living",
                comment: "Icon name chosen on the frontend (e.g. living, bedroom, kitchen)",
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

        await queryInterface.addIndex("rooms", ["user_id"]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("rooms");
    },
};
