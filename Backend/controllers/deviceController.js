const { Device, Room, DeviceType } = require("../models");
const { recordLog } = require("../services/logger");

// Verify a room (if provided) exists and belongs to the user.
// Returns { ok: true, value } where value is the normalized room_id,
// or { ok: false, message } on validation failure.
async function resolveRoomId(roomId, userId) {
    if (roomId === undefined) return { ok: true, value: undefined };
    if (roomId === null) return { ok: true, value: null };

    const room = await Room.findOne({ where: { id: roomId, user_id: userId } });
    if (!room) {
        return { ok: false, message: "Room not found or does not belong to you." };
    }
    return { ok: true, value: roomId };
}

// Verify a device type (if provided) exists and belongs to the user.
async function resolveTypeId(typeId, userId) {
    if (typeId === undefined) return { ok: true, value: undefined };
    if (typeId === null) return { ok: true, value: null };

    const type = await DeviceType.findOne({ where: { id: typeId, user_id: userId } });
    if (!type) {
        return { ok: false, message: "Device type not found or does not belong to you." };
    }
    return { ok: true, value: typeId };
}

const deviceIncludes = [
    { model: Room, as: "room" },
    { model: DeviceType, as: "type" },
];

const getAllDevices = async (req, res) => {
    try {
        const userId = req.user.id;
        const devices = await Device.findAll({
            where: { user_id: userId },
            include: deviceIncludes,
            order: [["created_at", "ASC"]],
        });
        res.json({ data: devices });
    } catch (error) {
        console.error("Get all devices error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

const getDeviceById = async (req, res) => {
    try {
        const userId = req.user.id;
        const device = await Device.findOne({
            where: { id: req.params.id, user_id: userId },
            include: deviceIncludes,
        });

        if (!device) {
            return res.status(404).json({ message: "Device not found." });
        }

        res.json({ data: device });
    } catch (error) {
        console.error("Get device error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

const createDevice = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, slot, status, room_id, type_id, icon } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Device name is required." });
        }

        if (slot === undefined || slot === null) {
            return res.status(400).json({ message: "Slot number is required." });
        }

        const roomCheck = await resolveRoomId(room_id, userId);
        if (!roomCheck.ok) {
            return res.status(400).json({ message: roomCheck.message });
        }

        const typeCheck = await resolveTypeId(type_id, userId);
        if (!typeCheck.ok) {
            return res.status(400).json({ message: typeCheck.message });
        }

        // Cek apakah slot sudah dipakai oleh user ini
        const existingSlot = await Device.findOne({
            where: { user_id: userId, slot },
        });

        if (existingSlot) {
            return res.status(409).json({ message: `Slot ${slot} is already in use by device "${existingSlot.name}".` });
        }

        const device = await Device.create({
            user_id: userId,
            name,
            slot,
            status: status !== undefined ? status : false,
            room_id: roomCheck.value !== undefined ? roomCheck.value : null,
            type_id: typeCheck.value !== undefined ? typeCheck.value : null,
            icon: icon !== undefined ? icon : null,
        });

        await recordLog({
            userId,
            deviceId: device.id,
            action: "device.create",
            description: `Created device "${device.name}" (slot ${device.slot})`,
        });

        res.status(201).json({ message: "Device created successfully.", data: device });
    } catch (error) {
        console.error("Create device error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

const updateDevice = async (req, res) => {
    try {
        const userId = req.user.id;
        const device = await Device.findOne({
            where: { id: req.params.id, user_id: userId },
        });

        if (!device) {
            return res.status(404).json({ message: "Device not found." });
        }

        const { name, slot, status, room_id, type_id, icon } = req.body;

        const roomCheck = await resolveRoomId(room_id, userId);
        if (!roomCheck.ok) {
            return res.status(400).json({ message: roomCheck.message });
        }

        const typeCheck = await resolveTypeId(type_id, userId);
        if (!typeCheck.ok) {
            return res.status(400).json({ message: typeCheck.message });
        }

        // Cek apakah slot baru sudah dipakai oleh device lain
        if (slot !== undefined && slot !== device.slot) {
            const existingSlot = await Device.findOne({
                where: { user_id: userId, slot },
            });
            if (existingSlot) {
                return res.status(409).json({ message: `Slot ${slot} is already in use by device "${existingSlot.name}".` });
            }
        }

        await device.update({
            name: name !== undefined ? name : device.name,
            slot: slot !== undefined ? slot : device.slot,
            status: status !== undefined ? status : device.status,
            room_id: roomCheck.value !== undefined ? roomCheck.value : device.room_id,
            type_id: typeCheck.value !== undefined ? typeCheck.value : device.type_id,
            icon: icon !== undefined ? icon : device.icon,
        });

        await recordLog({
            userId,
            deviceId: device.id,
            action: "device.update",
            description: `Updated device "${device.name}"`,
        });

        res.json({ message: "Device updated successfully.", data: device });
    } catch (error) {
        console.error("Update device error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

const deleteDevice = async (req, res) => {
    try {
        const userId = req.user.id;
        const device = await Device.findOne({
            where: { id: req.params.id, user_id: userId },
        });

        if (!device) {
            return res.status(404).json({ message: "Device not found." });
        }

        await device.destroy();

        await recordLog({
            userId,
            deviceId: device.id,
            action: "device.delete",
            description: `Deleted device "${device.name}" (slot ${device.slot})`,
        });

        res.json({ message: "Device deleted successfully.", data: device });
    } catch (error) {
        console.error("Delete device error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

const updateDeviceStatus = async (req, res, broadcastStatus) => {
    try {
        const userId = req.user.id;
        const { deviceId, status } = req.body;

        if (deviceId === undefined || status === undefined) {
            return res.status(400).json({ message: "deviceId and status are required." });
        }

        const device = await Device.findOne({
            where: { id: deviceId, user_id: userId },
        });

        if (!device) {
            return res.status(404).json({ message: "Device not found." });
        }

        const time = new Date().toTimeString().split(" ")[0];
        await device.update({ status });
        broadcastStatus(userId, device.id, device.name, device.slot, status, time);

        await recordLog({
            userId,
            deviceId: device.id,
            action: "device.status",
            description: `Turned "${device.name}" ${status ? "ON" : "OFF"}`,
            metadata: { slot: device.slot, status },
        });

        res.json({ message: "Device state updated successfully.", data: device });
    } catch (error) {
        console.error("Update device status error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

module.exports = {
    getAllDevices,
    getDeviceById,
    createDevice,
    updateDevice,
    deleteDevice,
    updateDeviceStatus,
};
