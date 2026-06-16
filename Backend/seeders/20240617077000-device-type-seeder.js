"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Per-user device types for the seeded user (id 1).
        return queryInterface.bulkInsert(
            "device_types",
            [
                { id: 1, user_id: 1, name: "Light", icon: "light", created_at: new Date(), updated_at: new Date() },
                { id: 2, user_id: 1, name: "Speaker", icon: "speaker", created_at: new Date(), updated_at: new Date() },
                { id: 3, user_id: 1, name: "Thermostat", icon: "thermostat", created_at: new Date(), updated_at: new Date() },
                { id: 4, user_id: 1, name: "Router", icon: "router", created_at: new Date(), updated_at: new Date() },
                { id: 5, user_id: 1, name: "TV", icon: "tv", created_at: new Date(), updated_at: new Date() },
                { id: 6, user_id: 1, name: "Smart Plug", icon: "plug", created_at: new Date(), updated_at: new Date() },
                { id: 7, user_id: 1, name: "Air Conditioner", icon: "ac", created_at: new Date(), updated_at: new Date() },
            ],
            {}
        );
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.bulkDelete("device_types", null, {});
    },
};
