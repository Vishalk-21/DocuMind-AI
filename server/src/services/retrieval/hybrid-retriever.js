import {
    createEmbedding
} from "../embedding/embedding.service.js";

import {
    vectorSearch,
    searchMongoChunks
} from "./vector-retriever.js";

import {
    graphSearch
} from "./graph-retriever.js";

export const hybridSearch =
    async ({
        query,
        documentId
    }) => {

        let vectorResults = [];
        let queryVector = null;

        try {
            queryVector =
                await createEmbedding(
                    query
                );
        } catch (error) {
            console.warn("Embedding creation unavailable, falling back:", error.message);
        }

        if (queryVector && queryVector.length) {
            try {
                vectorResults =
                    await vectorSearch(
                        queryVector,
                        documentId
                    );
            } catch (error) {
                console.warn("Vector search failed, will use chunk fallback:", error.message);
            }
        }

        // If vector results are empty or vector search was unavailable, search MongoDB chunks!
        if (!vectorResults || vectorResults.length === 0) {
            try {
                vectorResults = await searchMongoChunks(query, documentId);
            } catch (error) {
                console.warn("Mongo chunk fallback search failed:", error.message);
            }
        }

        let graphResults = [];

        try {
            graphResults = await graphSearch(
                query,
                documentId
            );
        } catch (error) {
            console.warn("Graph retrieval unavailable:", error.message);
        }

        return {
            vectorResults: vectorResults || [],
            graphResults: graphResults || []
        };
    };