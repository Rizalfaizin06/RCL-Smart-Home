"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.bulkInsert(
            "rooms",
            [
                { id: 1, user_id: 1, name: "Living room", icon: "living", created_at: new Date(), updated_at: new Date() },
                { id: 2, user_id: 1, name: "Bedroom", icon: "bedroom", created_at: new Date(), updated_at: new Date() },
                { id: 3, user_id: 1, name: "Kitchen", icon: "kitchen", created_at: new Date(), updated_at: new Date() },
                { id: 4, user_id: 1, name: "Bathroom", icon: "bathroom", created_at: new Date(), updated_at: new Date() },
                { id: 5, user_id: 1, name: "Garage", icon: "garage", created_at: new Date(), updated_at: new Date() },
                { id: 6, user_id: 1, name: "Office", icon: "office", created_at: new Date(), updated_at: new Date() },
            ],
            {}
        );
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.bulkDelete("rooms", null, {});
    },
};
