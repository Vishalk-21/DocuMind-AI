import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
    try {
        const sessionId = req.cookies?.documind_session;

        if (!sessionId) {
            return res.status(401).json({
                success: false,
                error: { code: "AUTH_REQUIRED", message: "Authentication required" }
            });
        }

        const user = await User.findById(sessionId);

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
