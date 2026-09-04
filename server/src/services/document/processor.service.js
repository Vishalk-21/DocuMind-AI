import Document from "../../models/Document.js";

import {
    extractPdfText
} from "../pdf/extractor.js";

import {
    classifyDocument
} from "../pdf/classifier.js";

import {
    createEmbeddings
} from "../embedding/embedding.service.js";

import {
    vectorSearch
} from "../retrieval/vector-retriever.js";


const updateProgress = async (
    documentId,
    status,
    progress,
    statusMessage
) => {

    await Document.findOneAndUpdate(
        { documentId },
        {
            status,
            progress,
            statusMessage
        }
    );
};


export const processDocument = async ({
    documentId,
    filePath
}) => {

    try {

        // ==========================
        // 1. EXTRACT
        // ==========================

        await updateProgress(
            documentId,
            "extracting",
            10,
            "Extracting text from PDF"
        );

        const extracted =
            await extractPdfText(filePath);


        await Document.findOneAndUpdate(
            { documentId },
            {
                pageCount:
                    extracted.pageCount
            }
        );


        // ==========================
        // 2. CLASSIFY
        // ==========================

        await updateProgress(
            documentId,
            "classifying",
            20,
            "Analyzing PDF structure"
        );

        const type =
            classifyDocument(
                extracted.pages
            );


        // ==========================
        // 3. OCR
        // ==========================

        if (
            type === "scanned" ||
            type === "mixed"
        ) {

            await updateProgress(
                documentId,
                "ocr",
                30,
                "Reading scanned pages using OCR"
            );

            // OCR implementation
            // will be connected here
        }


        // ==========================
        // 4. CLEANING
        // ==========================

        await updateProgress(
            documentId,
            "cleaning",
            40,
            "Cleaning extracted content"
        );

        // cleaner service


        // ==========================
        // 5. CHUNKING
        // ==========================

        await updateProgress(
            documentId,
            "chunking",
            50,
            "Splitting document into searchable chunks"
        );

        // chunker service


        // ==========================
        // 6. EMBEDDING
        // ==========================

        await updateProgress(
            documentId,
            "embedding",
            65,
            "Creating semantic embeddings"
        );

        // embedding service


        // ==========================
        // 7. QDRANT
        // ==========================

        await updateProgress(
            documentId,
            "vector_indexing",
            80,
            "Storing vectors in Qdrant"
        );

        // Qdrant indexing


        // ==========================
        // 8. NEO4J
        // ==========================

        await updateProgress(
            documentId,
            "graph_indexing",
            90,
            "Building document relationships"
        );

        // Neo4j indexing


        // ==========================
        // 9. COMPLETE
        // ==========================

        await updateProgress(
            documentId,
            "completed",
            100,
            "PDF is ready for chat"
        );

        return true;

    } catch (error) {

        await Document.findOneAndUpdate(
            { documentId },
            {
                status: "failed",
                statusMessage:
                    "Document processing failed",
                error: error.message
            }
        );

        throw error;
    }
};