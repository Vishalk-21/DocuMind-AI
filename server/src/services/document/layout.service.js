import gemini from "../../config/gemini.js";

export const analyzeLayout = async (pageText) => {

    const prompt = `
Analyze this document page.

Identify:

1. headings
2. paragraphs
3. lists
4. tables
5. important entities

Do not invent information.

Document:

${pageText}
`;

    const response =
        await gemini.models.generateContent({

            model: "gemini-3.6-flash",

            contents: prompt
        });

    return response.text;
};