import {
    createEmbedding
} from "../embedding/embedding.service.js";

import {
    vectorSearch
} from "./vector-retriever.js";

import {
    graphSearch
} from "./graph-retriever.js";

export const hybridSearch =
    async ({
        query,
        documentId
    }) => {

        const queryVector =
            await createEmbedding(
                query
            );

        const vectorResults =
            await vectorSearch(
                queryVector,
                documentId
            );

        let graphResults = [];

        try {
            graphResults = await graphSearch(
                query,
                documentId
            );
        } catch (error) {
            console.error("Graph retrieval unavailable:", error.message);
        }

        return {
            vectorResults,
            graphResults
        };
    };