const { Room, Device, sequelize } = require("../models");
const { recordLog } = require("../services/logger");

const getAllRooms = async (req, res) => {
    try {
        const userId = req.user.id;

        const rooms = await Room.findAll({
            where: { user_id: userId },
            attributes: {
                include: [
                    [
                        sequelize.literal(
                            "(SELECT COUNT(*) FROM devices WHERE devices.room_id = Room.id)"
                        ),
                        "deviceCount",
                    ],
                ],
            },
            order: [["created_at", "ASC"]],
        });

        res.json({ data: rooms });
    } catch (error) {
        console.error("Get all rooms error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

const getRoomById = async (req, res) => {
    try {
        const userId = req.user.id;
        const room = await Room.findOne({
            where: { id: req.params.id, user_id: userId },
            include: { model: Device, as: "devices" },
        });

        if (!room) {
            return res.status(404).json({ message: "Room not found." });
        }

        res.json({ data: room });
    } catch (error) {
        console.error("Get room error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

const createRoom = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, icon } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Room name is required." });
        }

        const room = await Room.create({
            user_id: userId,
            name: name.trim(),
            icon: icon || "living",
        });

        await recordLog({
            userId,
            action: "room.create",
            description: `Created room "${room.name}"`,
            metadata: { roomId: room.id },
        });

        res.status(201).json({ message: "Room created successfully.", data: room });
    } catch (error) {
        console.error("Create room error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

const updateRoom = async (req, res) => {
    try {
        const userId = req.user.id;
        const room = await Room.findOne({
            where: { id: req.params.id, user_id: userId },
        });

        if (!room) {
            return res.status(404).json({ message: "Room not found." });
        }

        const { name, icon } = req.body;

        if (name !== undefined && !name.trim()) {
            return res.status(400).json({ message: "Room name cannot be empty." });
        }

        await room.update({
            name: name !== undefined ? name.trim() : room.name,
            icon: icon !== undefined ? icon : room.icon,
        });

        await recordLog({
            userId,
            action: "room.update",
            description: `Updated room "${room.name}"`,
            metadata: { roomId: room.id },
        });

        res.json({ message: "Room updated successfully.", data: room });
    } catch (error) {
        console.error("Update room error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

const deleteRoom = async (req, res) => {
    try {
        const userId = req.user.id;
        const room = await Room.findOne({
            where: { id: req.params.id, user_id: userId },
        });

        if (!room) {
            return res.status(404).json({ message: "Room not found." });
        }

        // Devices in this room have their room_id set to NULL via FK (ON DELETE SET NULL)
        await room.destroy();

        await recordLog({
            userId,
            action: "room.delete",
            description: `Deleted room "${room.name}"`,
            metadata: { roomId: room.id },
        });

        res.json({ message: "Room deleted successfully.", data: room });
    } catch (error) {
        console.error("Delete room error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

module.exports = {
    getAllRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom,
};
