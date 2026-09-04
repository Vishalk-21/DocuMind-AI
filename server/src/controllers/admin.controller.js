import User from "../models/User.js";
import Document from "../models/Document.js";
import Chat from "../models/Chat.js";
import Usage from "../models/Usage.js";

export const getAdminDashboard = async (req, res, next) => {
    try {
        const [totalUsers, activeUsers, docs, chats, usageSummary, chatUsageSummary] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isActive: true }),
            Document.countDocuments(),
            Chat.countDocuments(),
            Usage.aggregate([
                {
                    $group: {
                        _id: null,
                        totalTokens: { $sum: { $cond: [{ $gt: ["$totalTokens", 0] }, "$totalTokens", { $add: ["$inputTokens", "$outputTokens"] }] } },
                        requests: { $sum: 1 }
                    }
                }
            ])
            ,
            Chat.aggregate([
                { $unwind: "$messages" },
                {
                    $group: {
                        _id: null,
                        requests: {
                            $sum: { $cond: [{ $eq: ["$messages.role", "user"] }, 1, 0] }
                        },
                        totalCharacters: { $sum: { $strLenCP: "$messages.content" } }
                    }
                },
                {
                    $project: {
                        requests: 1,
                        totalTokens: { $ceil: { $divide: ["$totalCharacters", 4] } }
                    }
                }
            ])
        ]);

        const recordedUsage = usageSummary[0];
        const historicalUsage = chatUsageSummary[0];
        const totalTokens = recordedUsage?.requests
            ? recordedUsage.totalTokens
            : historicalUsage?.totalTokens || 0;
        const requests = recordedUsage?.requests
            ? recordedUsage.requests
            : historicalUsage?.requests || 0;

        return res.status(200).json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                documents: docs,
                chats: chats,
                totalTokens,
                requests,
                tokenSource: recordedUsage?.requests ? "recorded" : "estimated-from-chats"
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getAdminUsers = async (req, res, next) => {
    try {
        const users = await User.find().sort({ createdAt: -1 }).limit(50);
        return res.status(200).json({ success: true, users });
    } catch (error) {
        next(error);
    }
};

export const getAdminDocuments = async (req, res, next) => {
    try {
        const documents = await Document.find().sort({ createdAt: -1 }).limit(50);
        return res.status(200).json({ success: true, documents });
    } catch (error) {
        next(error);
    }
};

export const getAdminChats = async (req, res, next) => {
    try {
        const chats = await Chat.find().sort({ updatedAt: -1 }).limit(50);
        return res.status(200).json({ success: true, chats });
    } catch (error) {
        next(error);
    }
};

export const getAdminUsage = async (req, res, next) => {
    try {
        const usage = await Usage.find().sort({ createdAt: -1 }).limit(100);
        return res.status(200).json({ success: true, usage });
    } catch (error) {
        next(error);
    }
};
