import { createHash } from "node:crypto";

import qdrant from "../../config/qdrant.js";

const COLLECTION_NAME =
    "documind_chunks";

const getPointId = (chunkId) => {

    const hash =
        createHash("sha256")
            .update(chunkId)
            .digest("hex")
            .slice(0, 32);

    return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-${hash.slice(16, 20)}-${hash.slice(20)}`;
};

export const initializeQdrant =
    async () => {

        let collections;

        try {
            collections = await qdrant.getCollections();
        } catch (error) {
            throw new Error(
                `Qdrant is unavailable. Resume the Qdrant Cloud cluster and verify QDRANT_URL/API key. ${error.message}`
            );
        }

        const exists =
            collections.collections.some(
                collection =>
                    collection.name === COLLECTION_NAME
            );

        if (!exists) {

            await qdrant.createCollection(
                COLLECTION_NAME,
                {
                    vectors: {
                        size: 3072,
                        distance: "Cosine"
                    }
                }
            );
        }

        try {

            await qdrant.createPayloadIndex(
                COLLECTION_NAME,
                {
                    field_name: "documentId",
                    field_schema: "keyword",
                    wait: true
                }
            );

        } catch (error) {

            if (error.status !== 400) {
                throw error;
            }
        }
    };

export const storeChunks =
    async (chunks, embeddings) => {

        const points =
            chunks.map((chunk, index) => ({

                id: getPointId(chunk.chunkId),

                vector:
                    embeddings[index].values,

                payload: {

                    documentId:
                        chunk.documentId,

                    pageNumber:
                        chunk.pageNumber,

                    text:
                        chunk.text,

                    source:
                        chunk.source
                }
            }));

        await qdrant.upsert(
            COLLECTION_NAME,
            {
                wait: true,
                points
            }
        );
    };