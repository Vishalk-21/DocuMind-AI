import dotenv from "dotenv";
import mongoose from "mongoose";
import { hashPassword } from "../services/auth/auth.service.js";
import User from "../models/User.js";

dotenv.config();

const [, , name, email, password] = process.argv;

if (!name || !email || !password || password.length < 8) {
    console.error("Usage: npm run create-admin -- \"Admin Name\" admin@example.com password123");
    process.exit(1);
}

try {
    await mongoose.connect(process.env.MONGO_URI);
    const normalizedEmail = email.toLowerCase();
    const user = await User.findOneAndUpdate(
        { email: normalizedEmail },
        {
            name,
            email: normalizedEmail,
            passwordHash: await hashPassword(password),
            role: "admin",
            isEmailVerified: true,
            isActive: true
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    console.log(`Admin account ready: ${user.email}`);
} finally {
    await mongoose.disconnect();
}