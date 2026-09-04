import gemini from "../../../config/gemini.js";

export const generateWithGemini = async ({
    prompt,
    model = "gemini-3.6-flash",
    temperature = 0.2
}) => {

    const response =
        await gemini.models.generateContent({

            model,

            contents: prompt,

            config: {
                temperature
            }
        });

    return response.text;
};