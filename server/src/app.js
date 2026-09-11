import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import documentRoutes from "./routes/document.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import adminAuthRoutes from "./routes/admin-auth.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import {
    apiLimiter
} from "./middleware/rate-limit.middleware.js";

const app = express();
const configuredClientOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        const isLocalDevelopment = !origin || /^http:\/\/localhost:\d+$/.test(origin);
        const isConfiguredOrigin = configuredClientOrigins.includes(origin?.replace(/\/$/, ""));

        if (isLocalDevelopment || isConfiguredOrigin) {
            return callback(null, true);
        }

        return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/chat", chatRoutes);

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "DocuMind API is running"
    });
});

app.use(errorHandler);

export default app;
