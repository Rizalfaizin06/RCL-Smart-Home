const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "smart-home-secret-key";

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access token is missing or invalid." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
}

// Must be used AFTER authenticate. Allows only users with the "admin" role.
function authorizeAdmin(req, res, next) {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required." });
    }
    next();
}

module.exports = { authenticate, authorizeAdmin, JWT_SECRET };
