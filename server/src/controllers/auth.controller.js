import User from "../models/User.js";
import Otp from "../models/Otp.js";
import { hashPassword, comparePassword, createSessionToken, sanitizeUser } from "../services/auth/auth.service.js";
import { storeOtp, verifyOtp } from "../services/auth/otp.service.js";

const createAuthResponse = (user, res) => {
    const sessionValue = user._id.toString();

    res.cookie("documind_session", sessionValue, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return {
        success: true,
        user: sanitizeUser(user),
        sessionId: sessionValue
    };
};

export const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, error: { code: "INVALID_REQUEST", message: "Name, email and password are required" } });
        }

        const existingUser = await User.findOne({ email: email.trim().toLowerCase() });

        if (existingUser) {
            return res.status(409).json({ success: false, error: { code: "EMAIL_EXISTS", message: "Email already registered" } });
        }

        const passwordHash = await hashPassword(password);

        const normalizedEmail = email.trim().toLowerCase();
        await storeOtp({
            email: normalizedEmail,
            purpose: "register",
            registration: { name, passwordHash }
        });

        return res.status(201).json({
            success: true,
            message: "Registration successful. Please verify your email OTP.",
            email: normalizedEmail
        });
    } catch (error) {
        next(error);
    }
};

export const verifyEmail = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, error: { code: "INVALID_REQUEST", message: "Email and OTP are required" } });
        }

        const result = await verifyOtp({ email: email.trim().toLowerCase(), purpose: "register", otp });

        if (!result.success) {
            return res.status(400).json({ success: false, error: { code: result.code, message: result.message } });
        }

        const registration = result.registration;
        if (!registration?.name || !registration?.passwordHash) {
            return res.status(400).json({ success: false, error: { code: "REGISTRATION_EXPIRED", message: "Registration details expired. Please register again." } });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });
        const user = existingUser || new User({
            name: registration.name,
            email: normalizedEmail,
            passwordHash: registration.passwordHash,
            role: "user"
        });

        user.name = registration.name;
        user.passwordHash = registration.passwordHash;
        user.isEmailVerified = true;
        user.otpVerifiedAt = new Date();
        await user.save();

        const response = createAuthResponse(user, res);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: { code: "INVALID_REQUEST", message: "Email and password are required" } });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() });

        if (!user) {
            return res.status(401).json({ success: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid credentials" } });
        }

        const isValid = await comparePassword(password, user.passwordHash);

        if (!isValid) {
            return res.status(401).json({ success: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid credentials" } });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, error: { code: "ACCOUNT_DISABLED", message: "Account disabled" } });
        }

        if (!user.isEmailVerified) {
            await storeOtp({
                email: user.email,
                purpose: "register",
                registration: { name: user.name, passwordHash: user.passwordHash }
            });

            return res.status(200).json({
                success: true,
                message: "Your email is not verified. A verification OTP was sent.",
                user: sanitizeUser(user),
                purpose: "register"
            });
        }

        await storeOtp({ email: user.email, purpose: "login" });

        return res.status(200).json({
            success: true,
            message: "OTP sent to your email.",
            user: sanitizeUser(user)
        });
    } catch (error) {
        next(error);
    }
};

export const forgotPassword = async (req, res, next) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        if (!email) {
            return res.status(400).json({ success: false, error: { code: "INVALID_REQUEST", message: "Email is required" } });
        }

        const user = await User.findOne({ email });
        if (user) {
            await storeOtp({ email, purpose: "reset-password" });
        }

        return res.status(200).json({ success: true, message: "If the account exists, a password reset OTP was sent." });
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { email, otp, password } = req.body;
        if (!email || !otp || !password || password.length < 8) {
            return res.status(400).json({ success: false, error: { code: "INVALID_REQUEST", message: "Email, OTP and a password of at least 8 characters are required" } });
        }

        const normalizedEmail = email.toLowerCase();
        const result = await verifyOtp({ email: normalizedEmail, purpose: "reset-password", otp });
        if (!result.success) {
            return res.status(400).json({ success: false, error: { code: result.code, message: result.message } });
        }

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({ success: false, error: { code: "RESET_INVALID", message: "Password reset request is invalid" } });
        }

        user.passwordHash = await hashPassword(password);
        await user.save();
        return res.status(200).json({ success: true, message: "Password reset successfully" });
    } catch (error) {
        next(error);
    }
};

export const adminLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email?.trim().toLowerCase() });
        if (!user || user.role !== "admin" || !(await comparePassword(password || "", user.passwordHash))) {
            return res.status(401).json({ success: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid admin credentials" } });
        }
        if (!user.isActive) {
            return res.status(403).json({ success: false, error: { code: "ACCOUNT_DISABLED", message: "Account disabled" } });
        }
        await storeOtp({ email: user.email, purpose: "admin-login" });
        return res.status(200).json({ success: true, message: "Admin OTP sent", email: user.email });
    } catch (error) {
        next(error);
    }
};

export const verifyAdminOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ success: false, error: { code: "INVALID_REQUEST", message: "Email and OTP are required" } });
        }
        const user = await User.findOne({ email: email?.trim().toLowerCase(), role: "admin", isActive: true });
        if (!user) {
            return res.status(401).json({ success: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid admin verification" } });
        }
        const result = await verifyOtp({ email: user.email, purpose: "admin-login", otp });
        if (!result.success) {
            return res.status(400).json({ success: false, error: { code: result.code, message: result.message } });
        }
        user.lastLoginAt = new Date();
        await user.save();
        return res.status(200).json(createAuthResponse(user, res));
    } catch (error) {
        next(error);
    }
};

export const verifyLoginOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, error: { code: "INVALID_REQUEST", message: "Email and OTP are required" } });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() });

        if (!user) {
            return res.status(404).json({ success: false, error: { code: "USER_NOT_FOUND", message: "User not found" } });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({ success: false, error: { code: "EMAIL_NOT_VERIFIED", message: "Email not verified" } });
        }

        const result = await verifyOtp({ email: user.email, purpose: "login", otp });

        if (!result.success) {
            return res.status(400).json({ success: false, error: { code: result.code, message: result.message } });
        }

        user.lastLoginAt = new Date();
        await user.save();

        const response = createAuthResponse(user, res);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

export const resendOtp = async (req, res, next) => {
    try {
        const { email, purpose = "login" } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, error: { code: "INVALID_REQUEST", message: "Email is required" } });
        }

        await storeOtp({ email: email.trim().toLowerCase(), purpose });

        return res.status(200).json({ success: true, message: "OTP resent successfully" });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res) => {
    res.clearCookie("documind_session");
    return res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const me = async (req, res) => {
    return res.status(200).json({
        success: true,
        user: sanitizeUser(req.user)
    });
};
