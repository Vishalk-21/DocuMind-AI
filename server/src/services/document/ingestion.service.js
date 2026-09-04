import {
    parseDocument
} from "../pdf/document-parser.js";

import {
    cleanPages
} from "./cleaner.service.js";

import {
    createChunks
} from "./chunker.service.js";

import {
    createEmbeddings
} from "../embedding/embedding.service.js";

import {
    storeChunks
} from "../vector/qdrant.service.js";

import {
    initializeQdrant
} from "../vector/qdrant.service.js";

import {
    generateSummary
} from "../llm/summary.service.js";

import {
    extractGraphBatch
} from "../graph/graph-extractor.js";

import {
    createDocumentGraph
} from "../graph/neo4j.service.js";

import Document from "../../models/Document.js";

const updateDocumentStatus =
    async (documentId, status, progress, statusMessage) => {

        await Document.updateOne(
            { documentId },
            {
                status,
                progress,
                statusMessage
            }
        );
    };

export const processDocument =
    async (documentId, filePath) => {

        console.log(
            "1. Parsing document..."
        );

        const parsed =
            await parseDocument(filePath);

        await updateDocumentStatus(
            documentId,
            "classifying",
            15,
            "Document type identified"
        );

        console.log(
            "2. Cleaning..."
        );

        const cleaned =
            cleanPages(parsed.pages);

        const pagesWithText =
            cleaned.filter(page => page.text?.trim());

        if (pagesWithText.length === 0) {
            throw new Error(
                "No readable text was found. Please upload a clearer scan."
            );
        }

        await updateDocumentStatus(
            documentId,
            "cleaning",
            28,
            "Cleaning extracted content"
        );

        console.log(
            "3. Creating chunks..."
        );

        const chunks =
            createChunks(
                pagesWithText,
                documentId
            );

        if (chunks.length === 0) {
            throw new Error(
                "No readable text was found. Please upload a clearer scan."
            );
        }

        await updateDocumentStatus(
            documentId,
            "chunking",
            38,
            `${chunks.length} searchable sections prepared`
        );

        console.log(
            "4. Creating embeddings..."
        );

        const embeddings =
            await createEmbeddings(
                chunks.map(
                    chunk => chunk.text
                )
            );

        await updateDocumentStatus(
            documentId,
            "embedding",
            55,
            "Semantic embeddings created"
        );

        console.log(
            "5. Storing vectors..."
        );

        await initializeQdrant();

        await storeChunks(
            chunks,
            embeddings
        );

        await updateDocumentStatus(
            documentId,
            "vector_indexing",
            66,
            "Semantic search index ready"
        );

        console.log(
            "6. Creating knowledge graph..."
        );

        const fullText =
            cleaned
                .map(page => page.text)
                .join("\n\n");

        const graphDataPromise = (async () => {

            const entities = new Map();
            const relationships = [];
            const graphBatchSize = 25;

            for (let start = 0; start < chunks.length; start += graphBatchSize) {

                const graphData =
                    await extractGraphBatch(
                        chunks.slice(
                            start,
                            start + graphBatchSize
                        )
                    );

                for (const entity of graphData.entities || []) {
                    entities.set(entity.id, entity);
                }

                relationships.push(
                    ...(graphData.relationships || [])
                );
            }

            return {
                entities: [...entities.values()],
                relationships
            };
        })();

        const summaryPromise =
            generateSummary(
                fullText
            );

        const graphData =
            await graphDataPromise;

        await updateDocumentStatus(
            documentId,
            "graph_indexing",
            76,
            "Knowledge graph extracted"
        );

        const entityNames =
            new Map(
                (graphData.entities || [])
                    .map(entity => [
                        entity.id,
                        entity.name
                    ])
            );

        const graphWriteBatchSize = 4;

        for (let start = 0; start < chunks.length; start += graphWriteBatchSize) {

            const graphWriteBatch =
                chunks.slice(
                    start,
                    start + graphWriteBatchSize
                );

            await Promise.all(
                graphWriteBatch.map(async (chunk) => {

            const chunkRelationships =
                (graphData.relationships || [])
                    .filter(relationship =>
                        relationship.chunkId === chunk.chunkId
                    );

            const relatedEntityIds =
                new Set(
                    chunkRelationships.flatMap(
                        relationship => [
                            relationship.source,
                            relationship.target
                        ]
                    )
                );

            const chunkEntities =
                (graphData.entities || [])
                    .filter(entity =>
                        relatedEntityIds.has(entity.id)
                    )
                    .map(entity => ({
                        name: entity.name,
                        type: entity.type
                    }));

            const chunkGraphData = {
                entities: chunkEntities,
                relationships: chunkRelationships.map(relationship => ({
                    source: entityNames.get(relationship.source),
                    relation: relationship.relationship,
                    target: entityNames.get(relationship.target)
                }))
            };

                await createDocumentGraph({
                    documentId,
                    pageNumber: chunk.pageNumber,
                    chunkId: chunk.chunkId,
                    graphData: chunkGraphData
                });
                })
            );

            await updateDocumentStatus(
                documentId,
                "graph_indexing",
                76 + Math.round(
                    ((start + graphWriteBatch.length) / chunks.length) * 18
                ),
                `Graph relationships saved: ${Math.min(
                    start + graphWriteBatch.length,
                    chunks.length
                )} of ${chunks.length} sections`
            );
        }

        console.log(
            "7. Generating summary..."
        );

        const summary =
            await summaryPromise;

        await updateDocumentStatus(
            documentId,
            "graph_indexing",
            97,
            "Summary generated, finalizing document"
        );

        return {

            type:
                parsed.type,

            pageCount:
                parsed.pageCount,

            chunks,

            summary
        };
    };