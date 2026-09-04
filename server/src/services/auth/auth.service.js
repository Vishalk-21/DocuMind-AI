import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import User from "../../models/User.js";

export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
};

export const comparePassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};

export const createSessionToken = () => {
    return crypto.randomBytes(32).toString("hex");
};

export const sanitizeUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
});
