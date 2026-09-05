import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
    {
        documentId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        fileName: {
            type: String,
            required: true
        },

        filePath: {
            type: String,
            required: true
        },

        contentHash: {
            type: String,
            sparse: true,
            index: true
        },

        pageCount: {
            type: Number,
            default: 0
        },
        userId: {
           type: mongoose.Schema.Types.ObjectId,
           ref: "User",
           required: true,
             index: true
         },

        status: {
            type: String,
            enum: [
                "uploaded",
                "extracting",
                "classifying",
                "ocr",
                "cleaning",
                "chunking",
                "embedding",
                "vector_indexing",
                "graph_indexing",
                "completed",
                "failed"
            ],
            default: "uploaded"
        },

        progress: {
            type: Number,
            default: 0
        },

        statusMessage: {
            type: String,
            default: "Document uploaded"
        },

        error: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model(
    "Document",
    documentSchema
);

documentSchema.index(
    { userId: 1, contentHash: 1 },
    { unique: true, sparse: true }
);