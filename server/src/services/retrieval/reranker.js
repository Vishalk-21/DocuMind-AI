import gemini from "../../config/gemini.js";

export const rerankChunks =
    async (query, chunks) => {

        const context =
            chunks.map(
                (chunk, index) => `
CHUNK ${index + 1}

Page:
${chunk.payload.pageNumber}

Text:
${chunk.payload.text}
`
            ).join("\n");

        const prompt = `
Question:
${query}

Rank the chunks according to
how useful they are for answering
the question.

Return the most relevant chunks first.

${context}
`;

        const response =
            await gemini.models.generateContent({

                model: "gemini-3.6-flash",

                contents: prompt
            });

        return response.text;
    };