import groq from "../../../config/groq.js";

export const generateWithGroq = async ({
    prompt,
    model,
    temperature = 0.2
}) => {
    if (!groq) {
        throw new Error("Groq provider not initialized. Please set GROQ_API_KEY environment variable.");
    }

    const response =
        await groq.chat.completions.create({

            model,

            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],

            temperature
        });

    return response.choices[0]
        .message.content;
};