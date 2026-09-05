import Document from "../models/Document.js";

import {
    randomUUID
} from "node:crypto";

import {
    unlink
} from "node:fs/promises";

import {
    calculateFileHash
} from "../utils/fileHash.js";

import {
    processDocument
} from "../services/document/ingestion.service.js";

import {
    parseDocument
} from "../services/pdf/document-parser.js";

import {
    cleanPages
} from "../services/document/cleaner.service.js";

const startDocumentProcessing = (document) => {

    processDocument(
        document.documentId,
        document.filePath
    ).then(async (result) => {

        await Document.updateOne(
            { documentId: document.documentId },
            {
                pageCount: result.pageCount,
                status: "completed",
                progress: 100,
                statusMessage: "Document processing completed",
                error: null
            }
        );

    }).catch(async (error) => {

        console.error(error);

        await Document.updateOne(
            { documentId: document.documentId },
            {
                status: "failed",
                statusMessage: "Document processing failed",
                error: error.message
            }
        );
    });
};

export const uploadDocument = async (req, res, next) => {

    try {

        if (!req.file) {

            return res.status(400).json({
                success: false,
                message: "A supported document file is required"
            });
        }

        const contentHash = await calculateFileHash(req.file.path);

        const existingDocument = await Document.findOne({
            contentHash,
            userId: req.user._id
        });

        if (existingDocument) {

            if (existingDocument.status === "failed") {
                const retryDocument = await Document.findOneAndUpdate(
                    {
                        documentId: existingDocument.documentId,
                        userId: req.user._id,
                        status: "failed"
                    },
                    {
                        status: "extracting",
                        progress: 5,
                        statusMessage: "Retrying document processing",
                        error: null
                    },
                    { new: true }
                );

                if (retryDocument) {
                    retryDocument.filePath = retryDocument.filePath || req.file.path;
                    await Document.updateOne(
                        { documentId: retryDocument.documentId },
                        { filePath: retryDocument.filePath }
                    );
                    await unlink(req.file.path).catch(() => {});
                    startDocumentProcessing(retryDocument);

                    return res.status(202).json({
                        success: true,
                        duplicate: true,
                        retried: true,
                        document: {
                            documentId: retryDocument.documentId,
                            fileName: retryDocument.fileName,
                            status: retryDocument.status,
                            progress: retryDocument.progress,
                            statusMessage: retryDocument.statusMessage,
                            pageCount: retryDocument.pageCount
                        }
                    });
                }
            }

            await unlink(req.file.path).catch(() => {});

            return res.status(200).json({
                success: true,
                duplicate: true,
                document: {
                    documentId: existingDocument.documentId,
                    fileName: existingDocument.fileName,
                    status: existingDocument.status,
                    progress: existingDocument.progress,
                    statusMessage: existingDocument.statusMessage,
                    pageCount: existingDocument.pageCount
                }
            });
        }

        let document;

        try {
            document = await Document.create({
                documentId: randomUUID(),
                userId: req.user._id,
                fileName: req.file.originalname,
                filePath: req.file.path,
                contentHash,
                status: "extracting",
                progress: 5,
                statusMessage: "Processing document"
            });
        } catch (error) {
            if (error.code !== 11000) throw error;

            const concurrentDocument = await Document.findOne({
                contentHash,
                userId: req.user._id
            });
            await unlink(req.file.path).catch(() => {});

            return res.status(200).json({
                success: true,
                duplicate: true,
                document: {
                    documentId: concurrentDocument.documentId,
                    fileName: concurrentDocument.fileName,
                    status: concurrentDocument.status,
                    progress: concurrentDocument.progress,
                    statusMessage: concurrentDocument.statusMessage,
                    pageCount: concurrentDocument.pageCount
                }
            });
        }

        startDocumentProcessing(document);

        return res.status(202).json({
            success: true,
            document: {
                documentId: document.documentId,
                fileName: document.fileName,
                status: document.status,
                progress: document.progress,
                statusMessage: document.statusMessage
            }
        });

    } catch (error) {

        next(error);
    }
};

export const getDocumentPreview = async (req, res, next) => {
    try {
        const { documentId } = req.params;

        const document = await Document.findOne({
            documentId,
            userId: req.user._id
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found"
            });
        }

        const parsed = await parseDocument(document.filePath);
        const cleaned = cleanPages(parsed.pages || []);
        const text = cleaned
            .filter(page => page.text && page.text.trim())
            .map(page => page.text.trim())
            .join("\n\n");

        return res.status(200).json({
            success: true,
            documentId: document.documentId,
            fileName: document.fileName,
            text,
            pageCount: parsed.pageCount || document.pageCount || 0,
            type: parsed.type || "document"
        });
    } catch (error) {
        next(error);
    }
};

export const getDocumentStatus = async (req, res, next) => {

    try {

        const { documentId } = req.params;

        const document =
            await Document.findOne({
                documentId,
                userId: req.user._id
            });

        if (!document) {

            return res.status(404).json({
                success: false,
                message: "Document not found"
            });

        }

        return res.status(200).json({
            success: true,

            document: {
                documentId: document.documentId,
                fileName: document.fileName,
                pageCount: document.pageCount,
                status: document.status,
                progress: document.progress,
                statusMessage: document.statusMessage,
                error: document.error
            }
        });

    } catch (error) {

        next(error);
    }
};