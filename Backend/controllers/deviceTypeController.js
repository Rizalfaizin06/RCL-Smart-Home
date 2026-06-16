const { DeviceType, Device, sequelize } = require("../models");
const { recordLog } = require("../services/logger");

const getAllDeviceTypes = async (req, res) => {
    try {
        const userId = req.user.id;

        const types = await DeviceType.findAll({
            where: { user_id: userId },
            attributes: {
                include: [
                    [
                        sequelize.literal(
                            "(SELECT COUNT(*) FROM devices WHERE devices.type_id = DeviceType.id)"
                        ),
                        "deviceCount",
                    ],
                ],
            },
            order: [["created_at", "ASC"]],
        });

        res.json({ data: types });
    } catch (error) {
        console.error("Get all device types error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

const getDeviceTypeById = async (req, res) => {
    try {
        const userId = req.user.id;
        const type = await DeviceType.findOne({
            where: { id: req.params.id, user_id: userId },
            include: { model: Device, as: "devices" },
        });

        if (!type) {
            return res.status(404).json({ message: "Device type not found." });
        }

        res.json({ data: type });
    } catch (error) {
        console.error("Get device type error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

const createDeviceType = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, icon } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Device type name is required." });
        }

        const type = await DeviceType.create({
            user_id: userId,
            name: name.trim(),
            icon: icon || "generic",
        });

        await recordLog({
            userId,
            action: "deviceType.create",
            description: `Created device type "${type.name}"`,
            metadata: { typeId: type.id },
        });

        res.status(201).json({ message: "Device type created successfully.", data: type });
    } catch (error) {
        console.error("Create device type error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

const updateDeviceType = async (req, res) => {
    try {
        const userId = req.user.id;
        const type = await DeviceType.findOne({
            where: { id: req.params.id, user_id: userId },
        });

        if (!type) {
            return res.status(404).json({ message: "Device type not found." });
        }

        const { name, icon } = req.body;

        if (name !== undefined && !name.trim()) {
            return res.status(400).json({ message: "Device type name cannot be empty." });
        }

        await type.update({
            name: name !== undefined ? name.trim() : type.name,
            icon: icon !== undefined ? icon : type.icon,
        });

        await recordLog({
            userId,
            action: "deviceType.update",
            description: `Updated device type "${type.name}"`,
            metadata: { typeId: type.id },
        });

        res.json({ message: "Device type updated successfully.", data: type });
    } catch (error) {
        console.error("Update device type error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

const deleteDeviceType = async (req, res) => {
    try {
        const userId = req.user.id;
        const type = await DeviceType.findOne({
            where: { id: req.params.id, user_id: userId },
        });

        if (!type) {
            return res.status(404).json({ message: "Device type not found." });
        }

        // Devices of this type have their type_id set to NULL via FK (ON DELETE SET NULL)
        await type.destroy();

        await recordLog({
            userId,
            action: "deviceType.delete",
            description: `Deleted device type "${type.name}"`,
            metadata: { typeId: type.id },
        });

        res.json({ message: "Device type deleted successfully.", data: type });
    } catch (error) {
        console.error("Delete device type error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

module.exports = {
    getAllDeviceTypes,
    getDeviceTypeById,
    createDeviceType,
    updateDeviceType,
    deleteDeviceType,
};
