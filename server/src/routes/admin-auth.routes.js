import express from "express";
import { adminLogin, verifyAdminOtp } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", adminLogin);
router.post("/verify-otp", verifyAdminOtp);

export default router;