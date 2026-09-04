import express from "express";

import {
    chatLimiter
} from "../middleware/rate-limit.middleware.js";

import {
    askQuestion,
    getChat,
    getRecentChats
} from "../controllers/chat.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";


const router = express.Router();


router.post(
    "/",
    authMiddleware,
    chatLimiter,
    askQuestion
);


router.get(
    "/recent",
    authMiddleware,
    getRecentChats
);


router.get(
    "/:chatId",
    authMiddleware,
    getChat
);


export default router;