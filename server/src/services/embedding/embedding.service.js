import gemini from "../../config/gemini.js";

export const createEmbedding = async (text) => {

    const result =
        await gemini.models.embedContent({

            model: "gemini-embedding-001",

            contents: text
        });

    return result.embeddings[0].values;
};


export const createEmbeddings = async (texts) => {

    if (!texts.length || texts.some(text => !text?.trim())) {
        throw new Error(
            "Cannot create embeddings for empty text"
        );
    }

    const result =
        await gemini.models.embedContent({

            model: "gemini-embedding-001",

            contents: texts
        });

    return result.embeddings;
};