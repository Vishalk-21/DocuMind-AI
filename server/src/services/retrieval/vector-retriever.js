import qdrant from "../../config/qdrant.js";

const COLLECTION =
    "documind_chunks";

export const vectorSearch =
    async (queryVector, documentId) => {

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

        return result.points;
    };