import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const bearerToken = authHeader?.startsWith("Bearer ")
            ? authHeader.slice(7).trim()
            : null;

        const sessionId = req.cookies?.documind_session || bearerToken || req.headers["x-session-id"];

        if (!sessionId || typeof sessionId !== "string") {
            return res.status(401).json({
                success: false,
                error: { code: "AUTH_REQUIRED", message: "Authentication required" }
            });
        }

        // Validate ObjectId format
        if (!/^[0-9a-fA-F]{24}$/.test(sessionId.trim())) {
            return res.status(401).json({
                success: false,
                error: { code: "INVALID_SESSION", message: "Invalid session credential" }
            });
        }

        const user = await User.findById(sessionId.trim());

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                error: { code: "AUTH_REQUIRED", message: "Authentication required" }
            });
        }

        req.user = user.toObject();
        next();
    } catch (error) {
        next(error);
    }
};

export const adminMiddleware = async (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            error: { code: "FORBIDDEN", message: "Admin access required" }
        });
    }
    next();
};
