import mongoose from "mongoose";

const chunkSchema = new mongoose.Schema(
    {
        chunkId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        documentId: {
            type: String,
            required: true,
            index: true
        },
        pageNumber: {
            type: Number,
            required: true
        },
        text: {
            type: String,
            required: true
        },
        source: {
            type: String,
            default: "pdf"
        },
        embedding: {
            type: [Number],
            default: []
        }
    },
    {
        timestamps: true
    }
);

chunkSchema.index({ documentId: 1, pageNumber: 1 });
chunkSchema.index({ text: "text" });

export default mongoose.model("Chunk", chunkSchema);
