import {
    routeAI
} from "../ai/ai.router.js";


export const extractGraphBatch = async (
    chunks
) => {

    // =====================================================
    // BUILD CHUNK INPUT
    // =====================================================

    const input = chunks
        .map((chunk) => {

            return `
CHUNK_ID: ${chunk.chunkId}

PAGE: ${chunk.pageNumber}

TEXT:
${chunk.text}

-----------------------------
`;
        })
        .join("\n");


    // =====================================================
    // GRAPH EXTRACTION PROMPT
    // =====================================================

    const prompt = `
You are extracting a knowledge graph
from a PDF document.

Your task is to extract:

1. Important entities
2. Important relationships between entities

STRICT RULES:

1. Use ONLY information explicitly present
   in the provided document chunks.

2. Do NOT use outside knowledge.

3. Do NOT invent entities.

4. Do NOT invent relationships.

5. Only create a relationship when the
   relationship is explicitly supported
   by the text.

6. Keep entities meaningful and useful
   for document question answering.

7. Avoid creating unnecessary entities
   such as generic words, common verbs,
   numbers, or meaningless phrases.

8. If the same entity appears in multiple
   chunks, use the same entity ID when
   the entity clearly refers to the same thing.

9. Every relationship must reference
   entity IDs that exist in the entities array.

10. Preserve the chunkId where the
    relationship was found.

11. Return ONLY valid JSON.

12. Do NOT return Markdown.

13. Do NOT wrap JSON inside \`\`\`json blocks.


EXPECTED JSON STRUCTURE:

{
    "entities": [
        {
            "id": "entity_id",
            "name": "Entity Name",
            "type": "PERSON|ORGANIZATION|LOCATION|CONCEPT|OTHER"
        }
    ],

    "relationships": [
        {
            "source": "entity_id",
            "relationship": "RELATIONSHIP_TYPE",
            "target": "entity_id",
            "chunkId": "chunk_id"
        }
    ]
}


DOCUMENT CHUNKS:

${input}
`;


    // =====================================================
    // AI ROUTER
    // =====================================================

    const response =
        await routeAI({

            task: "graph",

            prompt,

            temperature: 0.1

        });


    // =====================================================
    // CLEAN RESPONSE
    // =====================================================

    const content =
        response
            .trim()
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();


    // =====================================================
    // PARSE JSON
    // =====================================================

    let graphData;


    try {

        graphData =
            JSON.parse(content);

    } catch (error) {

        console.error(
            "Graph extraction returned invalid JSON:",
            content
        );

        throw new Error(
            "AI graph extraction returned invalid JSON"
        );
    }


    // =====================================================
    // VALIDATE BASIC STRUCTURE
    // =====================================================

    if (
        !graphData ||
        !Array.isArray(graphData.entities) ||
        !Array.isArray(graphData.relationships)
    ) {

        throw new Error(
            "Invalid graph extraction structure"
        );
    }


    return graphData;
};