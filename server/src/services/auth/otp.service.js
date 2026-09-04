import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import Otp from "../../models/Otp.js";
import { sendOtpEmail } from "../../config/mail.js";

const generateOtp = () => {
    return crypto.randomInt(100000, 999999).toString();
};

const hashOtp = async (otp) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(otp, salt);
};

export const storeOtp = async ({ email, purpose, registration }) => {
    email = email.trim().toLowerCase();
    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const previousOtp = await Otp.findOne({ email, purpose, usedAt: null }).sort({ createdAt: -1 });

    await Otp.deleteMany({ email, purpose, usedAt: null });

    await Otp.create({
        email,
        purpose,
        otpHash,
        registration: purpose === "register" ? registration || previousOtp?.registration : undefined,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    await sendOtpEmail({ email, otp });

    return { success: true };
};

export const verifyOtp = async ({ email, purpose, otp, maxAttempts = 5 }) => {
    email = email.trim().toLowerCase();
    otp = otp.trim();
    const otpRecord = await Otp.findOne({ email, purpose, usedAt: null }).sort({ createdAt: -1 });

    if (!otpRecord) {
        return { success: false, code: "OTP_INVALID", message: "OTP not found or expired" };
    }

    if (new Date() > otpRecord.expiresAt) {
        await Otp.deleteMany({ email, purpose, usedAt: null });
        return { success: false, code: "OTP_EXPIRED", message: "OTP expired" };
    }

    const isValid = await bcrypt.compare(otp, otpRecord.otpHash);

    if (!isValid) {
        otpRecord.attempts += 1;
        await otpRecord.save();

        if (otpRecord.attempts >= maxAttempts) {
            await Otp.deleteMany({ email, purpose, usedAt: null });
            return { success: false, code: "OTP_ATTEMPTS_EXCEEDED", message: "Too many OTP attempts" };
        }

        return { success: false, code: "OTP_INVALID", message: "Invalid OTP" };
    }

    otpRecord.usedAt = new Date();
    await otpRecord.save();

    return { success: true, registration: otpRecord.registration };
};
