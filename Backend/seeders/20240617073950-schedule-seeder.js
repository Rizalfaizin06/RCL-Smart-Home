"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.bulkInsert(
            "schedules",
            [
                {
                    user_id: 1,
                    device_id: 1,
                    hour: 6,
                    minute: 0,
                    second: 0,
                    status: true,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    user_id: 1,
                    device_id: 1,
                    hour: 23,
                    minute: 25,
                    second: 10,
                    status: true,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ],
            {}
        );
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.bulkDelete("schedules", null, {});
    },
};
