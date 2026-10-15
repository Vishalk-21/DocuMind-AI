import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

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
const clientOriginEnv = process.env.CLIENT_ORIGIN || process.env.CLIENT_URL || "http://localhost:5173";
const configuredClientOrigins = clientOriginEnv
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        const isLocalDevelopment = !origin || /^http:\/\/localhost:\d+$/.test(origin);
        const isConfiguredOrigin = configuredClientOrigins.includes(origin?.replace(/\/$/, ""));
        const isVercelOrigin = origin && /^https:\/\/[a-zA-Z0-9_.-]+\.vercel\.app$/.test(origin);

        if (isLocalDevelopment || isConfiguredOrigin || isVercelOrigin) {
            return callback(null, true);
        }

        return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "x-session-id"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "../../client/dist");

if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    app.get(/^(?!\/api).*/, (req, res) => {
        res.sendFile(path.join(clientDistPath, "index.html"));
    });
}

app.use(errorHandler);

export default app;
