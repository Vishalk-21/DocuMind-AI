import Document from "../models/Document.js";
import Chat from "../models/Chat.js";
import Usage from "../models/Usage.js";
import User from "../models/User.js";
import { hashPassword } from "../services/auth/auth.service.js";
import { storeOtp, verifyOtp } from "../services/auth/otp.service.js";

export const getProfile = async (req, res, next) => {
    try {
        return res.status(200).json({
            success: true,
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                isEmailVerified: req.user.isEmailVerified,
                isActive: req.user.isActive,
                lastLoginAt: req.user.lastLoginAt
            }
        });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const name = req.body.name?.trim();
        if (!name) {
            return res.status(400).json({ success: false, error: { code: "INVALID_REQUEST", message: "Name is required" } });
        }

        const user = await User.findByIdAndUpdate(req.user._id, { name }, { new: true });
        return res.status(200).json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role, isEmailVerified: user.isEmailVerified, isActive: user.isActive, lastLoginAt: user.lastLoginAt } });
    } catch (error) {
        next(error);
    }
};

export const requestPasswordChange = async (req, res, next) => {
    try {
        await storeOtp({ email: req.user.email, purpose: "reset-password" });
        return res.status(200).json({ success: true, message: "Password change OTP sent to your email" });
    } catch (error) {
        next(error);
    }
};

export const changePassword = async (req, res, next) => {
    try {
        const { otp, password } = req.body;
        if (!otp || !password || password.length < 8) {
            return res.status(400).json({ success: false, error: { code: "INVALID_REQUEST", message: "OTP and a password of at least 8 characters are required" } });
        }

        const result = await verifyOtp({ email: req.user.email, purpose: "reset-password", otp });
        if (!result.success) {
            return res.status(400).json({ success: false, error: { code: result.code, message: result.message } });
        }

        await User.findByIdAndUpdate(req.user._id, { passwordHash: await hashPassword(password) });
        return res.status(200).json({ success: true, message: "Password changed successfully" });
    } catch (error) {
        next(error);
    }
};

export const getUserUsage = async (req, res, next) => {
    try {
        const usage = await Usage.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(30);

        return res.status(200).json({
            success: true,
            usage
        });
    } catch (error) {
        next(error);
    }
};

export const getUserDocuments = async (req, res, next) => {
    try {
        const documents = await Document.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
        return res.status(200).json({ success: true, documents });
    } catch (error) {
        next(error);
    }
};

export const getUserChats = async (req, res, next) => {
    try {
        const chats = await Chat.find({ userId: req.user._id }).sort({ updatedAt: -1 }).limit(20);
        return res.status(200).json({ success: true, chats });
    } catch (error) {
        next(error);
    }
};
