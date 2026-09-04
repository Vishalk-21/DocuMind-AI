import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { changePassword, getProfile, getUserUsage, getUserDocuments, getUserChats, requestPasswordChange, updateProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.use(authMiddleware);
router.get("/profile", getProfile);
router.patch("/profile", updateProfile);
router.post("/password/request", requestPasswordChange);
router.post("/password/change", changePassword);
router.get("/usage", getUserUsage);
router.get("/documents", getUserDocuments);
router.get("/chats", getUserChats);

export default router;
