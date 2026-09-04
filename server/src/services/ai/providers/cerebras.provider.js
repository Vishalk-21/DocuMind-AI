import cerebras from "../../../config/cerebras.js";

export const generateWithCerebras = async ({
    prompt,
    model = "llama3.1-8b",
    temperature = 0.2
}) => {

    if (!cerebras) {
        throw new Error("Cerebras SDK is not installed or configured.");
    }

    const response =
        await cerebras.chat.completions.create({
            model,
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature
        });

    return response.choices[0].message.content;
};