import {
    generateAnswer
} from "../services/llm/answer.service.js";

import {
    hybridSearch
} from "../services/retrieval/hybrid-retriever.js";

import Chat from "../models/Chat.js";
import Usage from "../models/Usage.js";
import Document from "../models/Document.js";

import {
    randomUUID
} from "node:crypto";


export const askQuestion =
    async (req, res, next) => {

        try {

            const {
                documentId,
                question,
                chatId,
                summary,
                recentMessages
            } = req.body;


            if (!documentId) {

                return res.status(400).json({
                    message:
                        "documentId is required"
                });

            }


            if (!question?.trim()) {

                return res.status(400).json({
                    message:
                        "Question is required"
                });

            }

            const document = await Document.findOne({
                documentId,
                userId: req.user._id
            });

            if (!document) {
                return res.status(404).json({
                    message: "Document not found"
                });
            }


            const searchResults =
                await hybridSearch({
                    query: question,

                    documentId

                    // queryVector will be
                    // added by your embedding
                    // pipeline
                });


            const answer =
                await generateAnswer({

                    question,

                    vectorResults:
                        searchResults.vectorResults,

                    graphResults:
                        searchResults.graphResults,

                    chatSummary:
                        summary,

                    recentMessages
                });

            const inputTokens = Math.ceil(question.length / 4);
            const outputTokens = Math.ceil(answer.length / 4);

            const activeChat =
                chatId
                    ? await Chat.findOne({ chatId, documentId, userId: req.user._id })
                    : await Chat.create({
                        chatId: randomUUID(),
                        userId: req.user._id,
                        documentId
                    });

            if (!activeChat) {
                return res.status(404).json({
                    message: "Chat not found"
                });
            }

            activeChat.messages.push(
                {
                    role: "user",
                    content: question.trim()
                },
                {
                    role: "assistant",
                    content: answer
                }
            );

            activeChat.updatedAt = new Date();
            await activeChat.save();

            await Usage.create({
                userId: req.user._id,
                documentId,
                chatId: activeChat.chatId,
                provider: "gemini",
                task: "chat",
                inputTokens,
                outputTokens,
                totalTokens: inputTokens + outputTokens,
                metadata: { estimation: "approximately 4 characters per token" }
            });


            return res.status(200).json({

                success: true,
                answer,
                chatId: activeChat.chatId,
                messages: activeChat.messages

            });

        } catch (error) {

            next(error);
        }
    };

export const getRecentChats = async (req, res, next) => {

    try {

        const chats =
            await Chat.find({
                userId: req.user._id,
                ...(req.query.documentId
                    ? { documentId: req.query.documentId }
                    : {})
            })
                .sort({ updatedAt: -1 })
                .limit(12)
                .select("chatId documentId messages updatedAt")
                .lean();

        return res.json({
            success: true,
            chats: chats.map(chat => ({
                chatId: chat.chatId,
                documentId: chat.documentId,
                title: chat.messages.find(message =>
                    message.role === "user"
                )?.content || "New conversation",
                updatedAt: chat.updatedAt,
                messageCount: chat.messages.length
            }))
        });

    } catch (error) {
        next(error);
    }
};

export const getChat = async (req, res, next) => {

    try {

        const chat =
            await Chat.findOne({
                chatId: req.params.chatId,
                userId: req.user._id
            }).lean();

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        return res.json({
            success: true,
            chat: {
                chatId: chat.chatId,
                documentId: chat.documentId,
                messages: chat.messages
            }
        });

    } catch (error) {
        next(error);
    }
};