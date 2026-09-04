import express from "express";
import {
    uploadLimiter
} from "../middleware/rate-limit.middleware.js";
import {
    uploadDocument,
    getDocumentStatus
} from "../controllers/document.controller.js";

import upload from "../middleware/upload.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";


const router = express.Router();

router.post(
    "/upload",
    authMiddleware,
    uploadLimiter,
    upload.single("file"),
    uploadDocument
);

router.get(
    "/:documentId/preview",
    authMiddleware,
    getDocumentPreview
);

router.get(
    "/:documentId/status",
    authMiddleware,
    getDocumentStatus
);

export default router;