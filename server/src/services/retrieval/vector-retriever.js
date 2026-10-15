import qdrant from "../../config/qdrant.js";
import Chunk from "../../models/Chunk.js";

const COLLECTION =
    "documind_chunks";

export const searchMongoChunks = async (query, documentId) => {
    // 1. Try text index search if available
    let chunks = [];
    try {
        chunks = await Chunk.find(
            { documentId, $text: { $search: query } },
            { score: { $meta: "textScore" } }
        )
            .sort({ score: { $meta: "textScore" } })
            .limit(8)
            .lean();
    } catch {
        chunks = [];
    }

    // 2. Fallback to keyword matching if text search gave 0 results
    if (!chunks.length && query) {
        const keywords = query
            .split(/\s+/)
            .map(w => w.replace(/[^a-zA-Z0-9]/g, ""))
            .filter(w => w.length > 2)
            .slice(0, 6);

        if (keywords.length > 0) {
            const regexes = keywords.map(w => new RegExp(w, "i"));
            chunks = await Chunk.find({
                documentId,
                $or: regexes.map(r => ({ text: r }))
            })
                .limit(8)
                .lean();
        }
    }

    // 3. Fallback to the first chunks if still empty
    if (!chunks.length) {
        chunks = await Chunk.find({ documentId })
            .sort({ pageNumber: 1 })
            .limit(6)
            .lean();
    }

    return chunks.map(chunk => ({
        id: chunk.chunkId,
        payload: {
            chunkId: chunk.chunkId,
            documentId: chunk.documentId,
            pageNumber: chunk.pageNumber,
            text: chunk.text,
            source: chunk.source
        }
    }));
};

export const vectorSearch =
    async (queryVector, documentId) => {
        try {
            if (!queryVector || !queryVector.length) {
                return [];
            }

            const result =
                await qdrant.query(
                    COLLECTION,
                    {
                        query: queryVector,
                        limit: 10,
                        with_payload: true,
                        filter: {
                            must: [
                                {
                                    key: "documentId",
                                    match: {
                                        value: documentId
                                    }
                                }
                            ]
                        }
                    }
                );

            return result.points || [];
        } catch (error) {
            console.warn("Qdrant vector search failed, returning empty points for fallback:", error.message);
            return [];
        }
    };