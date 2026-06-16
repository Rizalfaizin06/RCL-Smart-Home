"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const now = Date.now();
        const at = (minutesAgo) => new Date(now - minutesAgo * 60000);

        return queryInterface.bulkInsert(
            "logs",
            [
                {
                    user_id: 1,
                    device_id: null,
                    action: "auth.login",
                    description: "rizal@rcl.my.id logged in",
                    metadata: null,
                    created_at: at(120),
                    updated_at: at(120),
                },
                {
                    user_id: 1,
                    device_id: 3,
                    action: "device.status",
                    description: 'Turned "Smart Light" ON',
                    metadata: JSON.stringify({ slot: 2, status: true }),
                    created_at: at(90),
                    updated_at: at(90),
                },
                {
                    user_id: 1,
                    device_id: 3,
                    action: "schedule.create",
                    description: 'Scheduled "Smart Light" ON at 18:00',
                    metadata: null,
                    created_at: at(60),
                    updated_at: at(60),
                },
                {
                    user_id: 2,
                    device_id: null,
                    action: "auth.login",
                    description: "admin@rcl.my.id logged in",
                    metadata: null,
                    created_at: at(30),
                    updated_at: at(30),
                },
            ],
            {}
        );
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.bulkDelete("logs", null, {});
    },
};
