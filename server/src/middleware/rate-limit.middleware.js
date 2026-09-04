import rateLimit from "express-rate-limit";


// General API limiter
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many requests."
    }
});


// Chat limiter
export const chatLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        success: false,
        message:
            "Too many chat requests. Please try again later."
    }
});


// Upload limiter
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        success: false,
        message:
            "Upload limit reached. Please try again later."
    }
});