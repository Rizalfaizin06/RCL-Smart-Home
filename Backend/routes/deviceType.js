const express = require("express");
const router = express.Router();
const {
    getAllDeviceTypes,
    getDeviceTypeById,
    createDeviceType,
    updateDeviceType,
    deleteDeviceType,
} = require("../controllers/deviceTypeController");
const { authenticate } = require("../middlewares/auth");

// All device-type routes require authentication
router.use(authenticate);

router.get("/", getAllDeviceTypes);
router.get("/:id", getDeviceTypeById);
router.post("/", createDeviceType);
router.put("/:id", updateDeviceType);
router.delete("/:id", deleteDeviceType);

module.exports = router;
