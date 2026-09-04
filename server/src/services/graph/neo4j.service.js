import driver from "../../config/neo4j.js";

export const createDocumentGraph =
    async ({
        documentId,
        pageNumber,
        chunkId,
        graphData = {}
    }) => {

        const session =
            driver.session();

        try {

            await session.run(
                `
                MERGE (d:Document {
                    id: $documentId
                })

                MERGE (p:Page {
                    documentId: $documentId,
                    pageNumber: $pageNumber
                })

                MERGE (c:Chunk {
                    id: $chunkId
                })

                MERGE (d)-[:HAS_PAGE]->(p)

                MERGE (p)-[:HAS_CHUNK]->(c)

                WITH c, $entities AS entities, $relationships AS relationships
                UNWIND entities AS entity
                MERGE (e:Entity {
                    name: entity.name,
                    documentId: $documentId
                })
                SET e.type = entity.type
                MERGE (c)-[:MENTIONS]->(e)

                WITH c, relationships
                UNWIND relationships AS relationship
                MATCH (source:Entity {
                    name: relationship.source,
                    documentId: $documentId
                })
                MATCH (target:Entity {
                    name: relationship.target,
                    documentId: $documentId
                })
                MERGE (source)-[r:RELATED_TO {
                    relation: relationship.relation,
                    documentId: $documentId
                }]->(target)
                `,
                {
                    documentId,
                    pageNumber,
                    chunkId,
                    entities: Array.isArray(graphData.entities)
                        ? graphData.entities
                        : [],
                    relationships: Array.isArray(graphData.relationships)
                        ? graphData.relationships
                        : []
                }
            );

        } finally {

            await session.close();
        }
    };