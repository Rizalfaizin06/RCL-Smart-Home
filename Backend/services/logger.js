const { Log } = require("../models");

/**
 * Record an application event to the logs table.
 * Failures are swallowed (logging must never break the main request flow).
 *
 * @param {Object} params
 * @param {number|null} params.userId    - user that triggered the event (null for system)
 * @param {number|null} [params.deviceId]
 * @param {string} params.action         - e.g. "auth.login", "device.create"
 * @param {string} [params.description]
 * @param {Object} [params.metadata]
 */
async function recordLog({ userId = null, deviceId = null, action, description = null, metadata = null }) {
    try {
        await Log.create({
            user_id: userId,
            device_id: deviceId,
            action,
            description,
            metadata,
        });
    } catch (error) {
        console.error("Failed to write log:", error.message);
    }
}

module.exports = { recordLog };
