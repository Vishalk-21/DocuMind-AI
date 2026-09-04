import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: true,
        lowercase: true,
        trim: true
    },
    purpose: {
        type: String,
        enum: ["register", "login", "reset-password", "admin-login"],
        required: true
    },
    otpHash: {
        type: String,
        required: true
    },
    registration: {
        name: String,
        passwordHash: String
    },
    attempts: {
        type: Number,
        default: 0
    },
    expiresAt: {
        type: Date,
        required: true
    },
    usedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Otp", otpSchema);
