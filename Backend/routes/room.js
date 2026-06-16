const express = require("express");
const router = express.Router();
const {
    getAllRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom,
} = require("../controllers/roomController");
const { authenticate } = require("../middlewares/auth");

// All room routes require authentication
router.use(authenticate);

router.get("/", getAllRooms);
router.get("/:id", getRoomById);
router.post("/", createRoom);
router.put("/:id", updateRoom);
router.delete("/:id", deleteRoom);

module.exports = router;
