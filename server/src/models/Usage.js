import mongoose from "mongoose";

const usageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    documentId: {
        type: String,
        default: null,
        index: true
    },
    chatId: {
        type: String,
        default: null,
        index: true
    },
    provider: {
        type: String,
        enum: ["gemini", "groq", "cerebras"],
        default: "gemini"
    },
    task: {
        type: String,
        enum: ["chat", "summary", "graph", "upload", "processing"],
        default: "chat"
    },
    inputTokens: {
        type: Number,
        default: 0
    },
    outputTokens: {
        type: Number,
        default: 0
    },
    totalTokens: {
        type: Number,
        default: 0
    },
    latencyMs: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ["success", "failed", "rate_limited"],
        default: "success"
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

export default mongoose.model("Usage", usageSchema);
