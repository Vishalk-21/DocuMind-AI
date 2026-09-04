import gemini from "../../config/gemini.js";

import {
    generateContentWithRetry
} from "../../utils/gemini.js";

export const generateSummary =
    async (documentText) => {

        const prompt = `
                You are DocuMind AI, an AI document analysis assistant.

                Create a concise, useful summary using ONLY information present in
                the document. Return Markdown only and follow this formatting contract:

                - Start with one H1 title.
                - Use H2 headings for major sections and H3 headings for subsections.
                - Use bullet points for lists and numbered lists for ordered procedures.
                - Use Markdown tables for comparisons or structured data. Every table
                    must have a separate header row, one row per line, and | between cells.
                - Write mathematical formulas as LaTeX: use $...$ inline and $$...$$
                    for important display equations. Keep important equations on their
                    own lines.
                - Preserve units and include page citations such as [Page 4] or
                    [Pages 2, 3] when page information is available in the document.
                - Do not use HTML, invent information, or use code fences unless the
                    document contains programming code.

DOCUMENT:

${documentText}
`;

        const response =
            await generateContentWithRetry(
                gemini,
                {

                    model: "gemini-3.6-flash",

                    contents: prompt
                }
            );

        return response.text.trim();
    };


export const summarizeConversation =
    async ({
        previousSummary,
        messages
    }) => {

        const conversation =
            messages
                .map(message => `
${message.role.toUpperCase()}:

${message.content}
`)
                .join("\n\n");


        const prompt = `
You maintain memory for a PDF chatbot.

Create an updated conversation summary.

PREVIOUS SUMMARY:

${previousSummary || "No previous summary."}


NEW CONVERSATION:

${conversation}


Rules:

1. Preserve important facts discussed.
2. Preserve names, dates and numbers.
3. Preserve important conclusions.
4. Preserve unresolved questions.
5. Remove greetings and unnecessary repetition.
6. Do not invent information.
7. Do not use outside information.
8. Merge the previous summary with the new messages.
9. Keep the summary concise.
10. Return only the updated summary.
`;


        const response =
            await generateContentWithRetry(
                gemini,
                {

                    model: "gemini-3.6-flash",

                    contents: prompt
                }
            );


        return response.text.trim();
    };