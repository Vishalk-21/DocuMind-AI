import mongoose from "mongoose";


const messageSchema =
    new mongoose.Schema({

        role: {
            type: String,

            enum: [
                "user",
                "assistant"
            ],

            required: true
        },

        content: {
            type: String,
            required: true
        },

        createdAt: {
            type: Date,
            default: Date.now
        }

    });


const chatSchema =
    new mongoose.Schema({

        chatId: {
            type: String,
            required: true,
            unique: true
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true
        },

        documentId: {
            type: String,
            required: true,
            index: true
        },

        summary: {
            type: String,
            default: ""
        },

        messages: {
            type: [messageSchema],
            default: []
        },

        status: {
            type: String,

            enum: [
                "active",
                "completed"
            ],

            default: "active"
        },

        expiresAt: {
            type: Date
        }

    }, {
        timestamps: true
    });


chatSchema.index(
    { expiresAt: 1 },
    {
        expireAfterSeconds: 0
    }
);


export default mongoose.model(
    "Chat",
    chatSchema
);