const nodeSchedule = require("node-schedule");
const { Schedule, Device } = require("../models");
const { recordLog } = require("../services/logger");

// In-memory store for scheduled jobs (keyed by schedule id)
let scheduledJobs = {};

// ========== Helpers ==========

// Register (or replace) a node-schedule job for a given schedule record.
function registerJob(data, broadcastStatus) {
    if (scheduledJobs[data.scheduleId]) {
        scheduledJobs[data.scheduleId].job.cancel();
        delete scheduledJobs[data.scheduleId];
    }

    const rule = new nodeSchedule.RecurrenceRule();
    rule.hour = data.hour;
    rule.minute = data.minute;
    rule.second = data.second;

    const job = nodeSchedule.scheduleJob(rule, () => {
        const now = new Date();
        const time = now.toTimeString().split(" ")[0];
        broadcastStatus(data.userId, data.deviceId, data.deviceName, data.slot, data.status, time);
    });

    scheduledJobs[data.scheduleId] = {
        job,
        device: data.deviceName,
        deviceId: data.deviceId,
        slot: data.slot,
        status: data.status,
        hour: data.hour,
        minute: data.minute,
        second: data.second,
        user_id: data.userId,
    };
}

// Compute the next run time (Asia/Jakarta, UTC+7) for a scheduled job.
function getNextRun(scheduleId) {
    const job = scheduledJobs[scheduleId];
    if (!job || !job.job.nextInvocation()) return null;

    const time = new Date(job.job.nextInvocation().toISOString());
    time.setUTCHours(time.getUTCHours() + 7);
    return time.toISOString().slice(2, 19).replace("T", " ");
}

// ========== Controllers ==========

const createSchedule = async (req, res, broadcastStatus) => {
    try {
        const userId = req.user.id;
        const { hour, minute, second, device_id, status } = req.body;

        if (isNaN(second) || second < 0 || second > 59) {
            return res.status(400).json({ message: "Invalid second parameter. It must be between 0 and 59." });
        }

        if (isNaN(minute) || minute < 0 || minute > 59) {
            return res.status(400).json({ message: "Invalid minute parameter. It must be between 0 and 59." });
        }

        if (isNaN(hour) || hour < 0 || hour > 23) {
            return res.status(400).json({ message: "Invalid hour parameter. It must be between 0 and 23." });
        }

        // Verify the device belongs to this user
        const device = await Device.findOne({
            where: { id: device_id, user_id: userId },
        });

        if (!device) {
            return res.status(404).json({ message: "Device not found or does not belong to you." });
        }

        const newSchedule = await Schedule.create({
            user_id: userId,
            device_id,
            hour,
            minute,
            second,
            status,
        });

        registerJob(
            {
                scheduleId: newSchedule.id,
                userId,
                deviceName: device.name,
                deviceId: device.id,
                slot: device.slot,
                hour,
                minute,
                second,
                status,
            },
            broadcastStatus
        );

        res.status(201).json({
            message: "Schedule created successfully.",
            data: {
                id: newSchedule.id,
                device_id: device.id,
                deviceName: device.name,
                slot: device.slot,
                status,
                hour,
                minute,
                second,
                nextRun: getNextRun(newSchedule.id),
            },
        });

        await recordLog({
            userId,
            deviceId: device.id,
            action: "schedule.create",
            description: `Scheduled "${device.name}" ${status ? "ON" : "OFF"} at ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
        });
    } catch (error) {
        console.error("Create schedule error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

const updateSchedule = async (req, res, broadcastStatus) => {
    try {
        const userId = req.user.id;
        const scheduleId = req.params.id;

        const schedule = await Schedule.findOne({
            where: { id: scheduleId, user_id: userId },
            include: { model: Device, as: "device" },
        });

        if (!schedule) {
            return res.status(404).json({ message: "Schedule not found." });
        }

        const { hour, minute, second, status } = req.body;

        if (hour !== undefined && (isNaN(hour) || hour < 0 || hour > 23)) {
            return res.status(400).json({ message: "Invalid hour parameter. It must be between 0 and 23." });
        }
        if (minute !== undefined && (isNaN(minute) || minute < 0 || minute > 59)) {
            return res.status(400).json({ message: "Invalid minute parameter. It must be between 0 and 59." });
        }
        if (second !== undefined && (isNaN(second) || second < 0 || second > 59)) {
            return res.status(400).json({ message: "Invalid second parameter. It must be between 0 and 59." });
        }

        await schedule.update({
            hour: hour !== undefined ? hour : schedule.hour,
            minute: minute !== undefined ? minute : schedule.minute,
            second: second !== undefined ? second : schedule.second,
            status: status !== undefined ? status : schedule.status,
        });

        registerJob(
            {
                scheduleId: schedule.id,
                userId,
                deviceName: schedule.device.name,
                deviceId: schedule.device.id,
                slot: schedule.device.slot,
                hour: schedule.hour,
                minute: schedule.minute,
                second: schedule.second,
                status: schedule.status,
            },
            broadcastStatus
        );

        res.json({
            message: "Schedule updated successfully.",
            data: {
                id: schedule.id,
                device_id: schedule.device_id,
                deviceName: schedule.device.name,
                slot: schedule.device.slot,
                status: schedule.status,
                hour: schedule.hour,
                minute: schedule.minute,
                second: schedule.second,
                nextRun: getNextRun(schedule.id),
            },
        });

        await recordLog({
            userId,
            deviceId: schedule.device_id,
            action: "schedule.update",
            description: `Updated schedule #${schedule.id} for "${schedule.device.name}"`,
        });
    } catch (error) {
        console.error("Update schedule error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

const deleteSchedule = async (req, res) => {
    try {
        const userId = req.user.id;
        const scheduleId = req.params.id;

        const schedule = await Schedule.findOne({
            where: { id: scheduleId, user_id: userId },
            include: { model: Device, as: "device" },
        });

        if (!schedule) {
            return res.status(404).json({ message: "Schedule not found." });
        }

        if (scheduledJobs[scheduleId]) {
            scheduledJobs[scheduleId].job.cancel();
            delete scheduledJobs[scheduleId];
        }

        await schedule.destroy();

        await recordLog({
            userId,
            deviceId: schedule.device_id,
            action: "schedule.delete",
            description: `Deleted schedule #${scheduleId}`,
        });

        res.json({ message: "Schedule deleted successfully.", data: schedule });
    } catch (error) {
        console.error("Delete schedule error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

const getAllSchedules = async (req, res) => {
    try {
        const userId = req.user.id;
        const { device_id } = req.query;

        const where = { user_id: userId };
        if (device_id !== undefined) {
            where.device_id = device_id;
        }

        // Read from DB (authoritative), enrich with live next-run from in-memory jobs
        const schedules = await Schedule.findAll({
            where,
            include: { model: Device, as: "device" },
            order: [
                ["hour", "ASC"],
                ["minute", "ASC"],
            ],
        });

        const data = schedules.map((s) => ({
            id: s.id,
            jobId: String(s.id),
            user_id: s.user_id,
            device_id: s.device_id,
            device: s.device ? s.device.name : null,
            slot: s.device ? s.device.slot : null,
            hour: s.hour,
            minute: s.minute,
            second: s.second,
            status: s.status,
            nextRun: getNextRun(s.id),
        }));

        res.json({ data });
    } catch (error) {
        console.error("Get schedules error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

async function refreshSchedules(broadcastStatus) {
    await cancelAllJobs();

    const schedules = await Schedule.findAll({
        include: { model: Device, as: "device" },
    });

    schedules.forEach((s) => {
        registerJob(
            {
                scheduleId: s.id,
                userId: s.user_id,
                deviceName: s.device.name,
                deviceId: s.device.id,
                slot: s.device.slot,
                hour: s.hour,
                minute: s.minute,
                second: s.second,
                status: s.status,
            },
            broadcastStatus
        );
    });

    const activeCount = Object.keys(scheduledJobs).length;
    console.log(`Loaded ${activeCount} scheduled jobs.`);
}

async function cancelAllJobs() {
    for (const jobId in scheduledJobs) {
        if (scheduledJobs.hasOwnProperty(jobId)) {
            scheduledJobs[jobId].job.cancel();
        }
    }
    scheduledJobs = {};
}

module.exports = {
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getAllSchedules,
    refreshSchedules,
};
