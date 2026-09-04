import express from "express";
import { forgotPassword, login, logout, me, register, resendOtp, resetPassword, verifyEmail, verifyLoginOtp } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/verify-login-otp", verifyLoginOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/resend-otp", resendOtp);
router.post("/logout", logout);
router.get("/me", authMiddleware, me);

export default router;
