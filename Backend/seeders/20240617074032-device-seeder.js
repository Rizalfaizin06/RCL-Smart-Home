"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.bulkInsert(
            "devices",
            [
                {
                    user_id: 1,
                    name: "Lampu 1",
                    slot: 1,
                    status: false,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    user_id: 1,
                    name: "Lampu 2",
                    slot: 2,
                    status: false,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    user_id: 1,
                    name: "Lampu 3",
                    slot: 3,
                    status: true,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    user_id: 1,
                    name: "Lampu 4",
                    slot: 4,
                    status: false,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ],
            {}
        );
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.bulkDelete("devices", null, {});
    },
};
