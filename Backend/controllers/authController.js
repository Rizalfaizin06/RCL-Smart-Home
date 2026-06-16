const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { JWT_SECRET } = require("../middlewares/auth");
const { recordLog } = require("../services/logger");

function signToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
    );
}

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required." });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: "Email already registered." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Role is always "user" on self-registration; admins are provisioned separately.
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "user",
        });

        const token = signToken(user);

        await recordLog({
            userId: user.id,
            action: "auth.register",
            description: `New user registered: ${user.email}`,
        });

        res.status(201).json({
            message: "User registered successfully.",
            data: { id: user.id, name: user.name, email: user.email, avatar_url: user.avatar_url, role: user.role },
            token,
        });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const token = signToken(user);

        await recordLog({
            userId: user.id,
            action: "auth.login",
            description: `${user.email} logged in`,
        });

        res.json({
            message: "Login successful.",
            data: { id: user.id, name: user.name, email: user.email, avatar_url: user.avatar_url, role: user.role },
            token,
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ["id", "name", "email", "avatar_url", "role", "created_at", "updated_at"],
        });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.json({ data: user });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

const updateProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const { name, email, password, avatar_url } = req.body;

        // If the email is being changed, ensure it is not taken by someone else
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(409).json({ message: "Email already registered." });
            }
        }

        const updates = {
            name: name !== undefined ? name : user.name,
            email: email !== undefined ? email : user.email,
            avatar_url: avatar_url !== undefined ? avatar_url : user.avatar_url,
        };

        if (password) {
            updates.password = await bcrypt.hash(password, 10);
        }

        await user.update(updates);

        await recordLog({
            userId: user.id,
            action: "profile.update",
            description: `${user.email} updated their profile`,
        });

        res.json({
            message: "Profile updated successfully.",
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar_url: user.avatar_url,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

module.exports = { register, login, getProfile, updateProfile };
