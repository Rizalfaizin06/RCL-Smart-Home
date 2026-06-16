const express = require("express");
const router = express.Router();
const {
    getStats,
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser,
    getAllDevices,
    getAllRooms,
    getAllDeviceTypes,
    getAllSchedules,
    getLogs,
} = require("../controllers/adminController");
const { authenticate, authorizeAdmin } = require("../middlewares/auth");

// All admin routes require a valid token AND the admin role
router.use(authenticate, authorizeAdmin);

router.get("/stats", getStats);

router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

router.get("/devices", getAllDevices);
router.get("/rooms", getAllRooms);
router.get("/device-types", getAllDeviceTypes);
router.get("/schedules", getAllSchedules);

router.get("/logs", getLogs);

module.exports = router;
