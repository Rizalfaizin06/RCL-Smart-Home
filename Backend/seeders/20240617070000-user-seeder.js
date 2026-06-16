"use strict";

const bcrypt = require("bcryptjs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const userPassword = await bcrypt.hash("rizal", 10);
        const adminPassword = await bcrypt.hash("admin", 10);

        return queryInterface.bulkInsert(
            "users",
            [
                {
                    id: 1,
                    name: "Rizal",
                    email: "rizal@rcl.my.id",
                    password: userPassword,
                    avatar_url: "https://portfolio.rizalscompanylab.my.id/images/avatar/rizal-square.jpg",
                    role: "user",
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    id: 2,
                    name: "Admin",
                    email: "admin@rcl.my.id",
                    password: adminPassword,
                    avatar_url: "https://portfolio.rizalscompanylab.my.id/images/avatar/rizal-square.jpg",
                    role: "admin",
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ],
            {}
        );
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.bulkDelete("users", null, {});
    },
};
