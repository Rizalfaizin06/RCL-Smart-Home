const express = require("express");
const router = express.Router();
const {
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getAllSchedules,
} = require("../controllers/scheduleController");
const { authenticate } = require("../middlewares/auth");

// All schedule routes require authentication
router.use(authenticate);

module.exports = (broadcastStatus) => {
    router.get("/", getAllSchedules);
    router.post("/", (req, res) => createSchedule(req, res, broadcastStatus));
    router.put("/:id", (req, res) => updateSchedule(req, res, broadcastStatus));
    router.delete("/:id", deleteSchedule);
    return router;
};
