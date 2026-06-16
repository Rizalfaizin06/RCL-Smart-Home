"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // room_id mapping (room-seeder): 1=Living, 2=Bedroom, 3=Kitchen
        // type_id mapping (device-type-seeder): 1=Light, 2=Speaker, 3=Thermostat,
        //   4=Router, 5=TV, 6=Smart Plug, 7=Air Conditioner
        return queryInterface.bulkInsert(
            "devices",
            [
                {
                    id: 1,
                    user_id: 1,
                    name: "Smart speaker",
                    slot: 0,
                    status: true,
                    room_id: 1,
                    type_id: 2,
                    icon: "speaker",
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: 2,
                    user_id: 1,
                    name: "Thermostat",
                    slot: 1,
                    status: false,
                    room_id: 1,
                    type_id: 3,
                    icon: "thermostat",
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: 3,
                    user_id: 1,
                    name: "Smart Light",
                    slot: 2,
                    status: true,
                    room_id: 1,
                    type_id: 1,
                    icon: "light",
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: 4,
                    user_id: 1,
                    name: "WiFi Router",
                    slot: 3,
                    status: true,
                    room_id: 1,
                    type_id: 4,
                    icon: "router",
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: 5,
                    user_id: 1,
                    name: "Bedroom Lamp",
                    slot: 4,
                    status: false,
                    room_id: 2,
                    type_id: 1,
                    icon: "light",
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: 6,
                    user_id: 1,
                    name: "Smart TV",
                    slot: 5,
                    status: false,
                    room_id: 2,
                    type_id: 5,
                    icon: "tv",
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: 7,
                    user_id: 1,
                    name: "Coffee Maker",
                    slot: 6,
                    status: false,
                    room_id: 3,
                    type_id: 6,
                    icon: "plug",
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: 8,
                    user_id: 1,
                    name: "Air Conditioner",
                    slot: 7,
                    status: true,
                    room_id: 2,
                    type_id: 7,
                    icon: "ac",
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
