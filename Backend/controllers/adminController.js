const { User, Device, Schedule, Log, Room, DeviceType, sequelize } = require("../models");
const { recordLog } = require("../services/logger");

const USER_SAFE_ATTRS = ["id", "name", "email", "avatar_url", "role", "created_at", "updated_at"];

// ========== Dashboard / stats ==========

const getStats = async (req, res) => {
    try {
        const [totalUsers, totalAdmins, totalDevices, devicesOn, totalSchedules, totalLogs] =
            await Promise.all([
                User.count(),
                User.count({ where: { role: "admin" } }),
                Device.count(),
                Device.count({ where: { status: true } }),
                Schedule.count(),
                Log.count(),
            ]);

        res.json({
            data: {
                users: { total: totalUsers, admins: totalAdmins, regular: totalUsers - totalAdmins },
                devices: { total: totalDevices, on: devicesOn, off: totalDevices - devicesOn },
                schedules: { total: totalSchedules },
                logs: { total: totalLogs },
            },
        });
    } catch (error) {
        console.error("Admin getStats error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

// ========== Users ==========

const getAllUsers = async (req, res) => {
    try {
        const { search, role } = req.query;
        const where = {};
        if (role) where.role = role;
        if (search) {
            const { Op } = require("sequelize");
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
            ];
        }

        const users = await User.findAll({
            where,
            attributes: {
                include: [
                    [
                        sequelize.literal(
                            "(SELECT COUNT(*) FROM devices WHERE devices.user_id = User.id)"
                        ),
                        "deviceCount",
                    ],
                    [
                        sequelize.literal(
                            "(SELECT COUNT(*) FROM schedules WHERE schedules.user_id = User.id)"
                        ),
                        "scheduleCount",
                    ],
                ],
                exclude: ["password"],
            },
            order: [["created_at", "DESC"]],
        });

        res.json({ data: users });
    } catch (error) {
        console.error("Admin getAllUsers error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: USER_SAFE_ATTRS,
            include: [
                { model: Device, as: "devices" },
                { model: Room, as: "rooms" },
                { model: DeviceType, as: "deviceTypes" },
                { model: Schedule, as: "schedules", include: { model: Device, as: "device" } },
            ],
        });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.json({ data: user });
    } catch (error) {
        console.error("Admin getUserById error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!["user", "admin"].includes(role)) {
            return res.status(400).json({ message: 'Role must be either "user" or "admin".' });
        }

        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Prevent removing the last admin
        if (user.role === "admin" && role === "user") {
            const adminCount = await User.count({ where: { role: "admin" } });
            if (adminCount <= 1) {
                return res.status(409).json({ message: "Cannot demote the last remaining admin." });
            }
        }

        await user.update({ role });

        await recordLog({
            userId: req.user.id,
            action: "admin.user.role",
            description: `Changed role of ${user.email} to ${role}`,
            metadata: { targetUserId: user.id, role },
        });

        res.json({
            message: "User role updated successfully.",
            data: { id: user.id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        console.error("Admin updateUserRole error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

const deleteUser = async (req, res) => {
    try {
        const targetId = Number(req.params.id);

        if (targetId === req.user.id) {
            return res.status(409).json({ message: "You cannot delete your own account." });
        }

        const user = await User.findByPk(targetId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Devices and schedules cascade via FK constraints
        await user.destroy();

        await recordLog({
            userId: req.user.id,
            action: "admin.user.delete",
            description: `Deleted user ${user.email}`,
            metadata: { targetUserId: targetId },
        });

        res.json({ message: "User deleted successfully.", data: { id: targetId } });
    } catch (error) {
        console.error("Admin deleteUser error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

// ========== Devices (all users) ==========

const getAllDevices = async (req, res) => {
    try {
        const { user_id } = req.query;
        const where = {};
        if (user_id) where.user_id = user_id;

        const devices = await Device.findAll({
            where,
            include: [
                { model: User, as: "user", attributes: ["id", "name", "email"] },
                { model: Room, as: "room" },
                { model: DeviceType, as: "type" },
            ],
            order: [["created_at", "DESC"]],
        });

        res.json({ data: devices });
    } catch (error) {
        console.error("Admin getAllDevices error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

// ========== Rooms (all users) ==========

const getAllRooms = async (req, res) => {
    try {
        const { user_id } = req.query;
        const where = {};
        if (user_id) where.user_id = user_id;

        const rooms = await Room.findAll({
            where,
            include: { model: User, as: "user", attributes: ["id", "name", "email"] },
            order: [["created_at", "DESC"]],
        });

        res.json({ data: rooms });
    } catch (error) {
        console.error("Admin getAllRooms error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

// ========== Device Types (all users) ==========

const getAllDeviceTypes = async (req, res) => {
    try {
        const { user_id } = req.query;
        const where = {};
        if (user_id) where.user_id = user_id;

        const types = await DeviceType.findAll({
            where,
            include: { model: User, as: "user", attributes: ["id", "name", "email"] },
            order: [["created_at", "DESC"]],
        });

        res.json({ data: types });
    } catch (error) {
        console.error("Admin getAllDeviceTypes error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

// ========== Schedules (all users) ==========

const getAllSchedules = async (req, res) => {
    try {
        const { user_id } = req.query;
        const where = {};
        if (user_id) where.user_id = user_id;

        const schedules = await Schedule.findAll({
            where,
            include: [
                { model: User, as: "user", attributes: ["id", "name", "email"] },
                { model: Device, as: "device", attributes: ["id", "name", "slot"] },
            ],
            order: [["created_at", "DESC"]],
        });

        res.json({ data: schedules });
    } catch (error) {
        console.error("Admin getAllSchedules error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

// ========== Logs ==========

const getLogs = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));
        const offset = (page - 1) * limit;

        const where = {};
        if (req.query.user_id) where.user_id = req.query.user_id;
        if (req.query.action) where.action = req.query.action;

        const { count, rows } = await Log.findAndCountAll({
            where,
            include: { model: User, as: "user", attributes: ["id", "name", "email"] },
            order: [["created_at", "DESC"]],
            limit,
            offset,
        });

        res.json({
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
            },
        });
    } catch (error) {
        console.error("Admin getLogs error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

module.exports = {
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
};
