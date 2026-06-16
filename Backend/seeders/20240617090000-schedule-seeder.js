"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.bulkInsert(
            "schedules",
            [
                // Smart Light (device 3) ON at 18:00
                {
                    user_id: 1,
                    device_id: 3,
                    hour: 18,
                    minute: 0,
                    second: 0,
                    status: true,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                // Smart Light (device 3) OFF at 23:30
                {
                    user_id: 1,
                    device_id: 3,
                    hour: 23,
                    minute: 30,
                    second: 0,
                    status: false,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                // Coffee Maker (device 7) ON at 06:30
                {
                    user_id: 1,
                    device_id: 7,
                    hour: 6,
                    minute: 30,
                    second: 0,
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
