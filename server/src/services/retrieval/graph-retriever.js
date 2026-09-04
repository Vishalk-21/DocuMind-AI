import driver from "../../config/neo4j.js";

export const graphSearch =
    async (entityName, documentId) => {

        const session =
            driver.session();

        try {

            const result =
                await session.run(
                    `
                    MATCH (e:Entity)
                    WHERE toLower(e.name)
                    CONTAINS toLower($entityName)
                    AND ($documentId IS NULL OR e.documentId = $documentId)

                    OPTIONAL MATCH
                    (e)-[r]-(related)

                    RETURN
                        e.name AS entity,
                        r.relation AS relation,
                        related.name AS related
                    LIMIT 20
                    `,
                    {
                        entityName,
                        documentId: documentId || null
                    }
                );

            return result.records.map(
                record => ({
                    entity:
                        record.get("entity"),

                    relation:
                        record.get("relation"),

                    related:
                        record.get("related")
                })
            );

        } finally {

            await session.close();
        }
    };