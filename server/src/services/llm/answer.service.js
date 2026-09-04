import {
    routeAI
} from "../ai/ai.router.js";


export const generateAnswer =
    async ({
        question,
        vectorResults,
        graphResults
    }) => {

        // =========================
        // VECTOR CONTEXT
        // =========================

        const vectorContext =
            vectorResults
                .map(result => {

                    return `
SOURCE
Page: ${result.payload.pageNumber}
Chunk ID: ${result.payload.chunkId || "unknown"}

CONTENT:
${result.payload.text}
`;
                })
                .join("\n\n");


        // =========================
        // GRAPH CONTEXT
        // =========================

        const graphContext =
            graphResults
                .map(result => {

                    return `
ENTITY: ${result.entity}
RELATIONSHIP: ${result.relation}
RELATED ENTITY: ${result.related}
`;
                })
                .join("\n");


        // =========================
        // PROMPT
        // =========================

        const prompt = `
You are DocuMind AI, a document question-answering assistant.

Your job is to answer the user's question ONLY using
the provided PDF context.

========================
STRICT KNOWLEDGE RULES
========================

1. Use ONLY information contained in the provided context.

2. NEVER use outside knowledge.

3. NEVER assume or invent missing information.

4. If the answer cannot be found in the provided context,
   respond exactly:

"This information is not available in the uploaded PDF."

5. If the question is completely unrelated to the PDF,
   respond exactly:

"This question is not related to the uploaded PDF."

6. If the context contains only partial information,
   clearly say that the document provides only partial information.

7. Do not make up page numbers.

8. Only mention a page number when it is provided in the context.

========================
ANSWER FORMATTING
========================

Return the answer using clean Markdown.

Follow these rules:

- Use # for the main heading when appropriate.
- Use ## for major sections.
- Use ### for subsections.
- Use short paragraphs.
- Use bullet points for multiple points.
- Use numbered lists for ordered steps or rankings.
- Use **bold** for important terms.
- Use tables when comparing multiple items.
- Use valid Markdown tables: separate the header row, delimiter row, and each
    data row with newlines, and separate every cell with |.
- Use blockquotes when highlighting an important statement.
- Use LaTeX for mathematical notation. Use $...$ for inline formulas and
    $$...$$ for important display equations on their own lines.
- Avoid unnecessary formatting.
- Do not create headings if the answer is very short.
- Do not repeat the user's question.
- Keep the answer clear and easy to read.
- Do not create unnecessarily long answers.

========================
CITATIONS
========================

For factual statements, include the relevant page number
when available.

Example:

The company was founded in 1995. **[Page 7]**

If multiple pages support the statement:

The company expanded internationally after 2005. **[Pages 7, 9]**

Never invent a citation.

========================
QUESTION
========================

${question}

========================
VECTOR SEARCH CONTEXT
========================

${vectorContext || "No relevant vector context found."}

========================
GRAPH CONTEXT
========================

${graphContext || "No relevant graph context found."}

========================
FINAL INSTRUCTION
========================

Answer the question using ONLY the provided context.
Do not use your general knowledge.
`;


        // =========================
        // AI ROUTER
        // =========================

        const response =
            await routeAI({

                task: "chat",

                prompt,

                temperature: 0.2

            });


        return response;
    };