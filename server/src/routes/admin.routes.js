import express from "express";
import { authMiddleware, adminMiddleware } from "../middleware/auth.middleware.js";
import { getAdminDashboard, getAdminUsers, getAdminDocuments, getAdminChats, getAdminUsage } from "../controllers/admin.controller.js";

const router = express.Router();

router.use(authMiddleware, adminMiddleware);
router.get("/dashboard", getAdminDashboard);
router.get("/users", getAdminUsers);
router.get("/documents", getAdminDocuments);
router.get("/chats", getAdminChats);
router.get("/usage", getAdminUsage);

export default router;
