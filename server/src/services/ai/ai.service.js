import {
    generateWithGemini
} from "./providers/gemini.provider.js";

import {
    generateWithGroq
} from "./providers/groq.provider.js";

import {
    generateWithCerebras
} from "./providers/cerebras.provider.js";


export const generateAI = async ({
    provider,
    prompt,
    model,
    temperature
}) => {

    switch (provider) {

        case "gemini":

            return generateWithGemini({
                prompt,
                model,
                temperature
            });


        case "groq":

            return generateWithGroq({
                prompt,
                model,
                temperature
            });

            case "cerebras":
                return generateWithCerebras({
               prompt,
              model,
            temperature
         });


        default:

            throw new Error(
                `Unsupported AI provider: ${provider}`
            );
    }
};