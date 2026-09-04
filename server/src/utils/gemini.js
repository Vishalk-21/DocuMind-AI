const isTransientGeminiError = (error) => {

    const status =
        error.status ||
        error.code ||
        error.error?.code;

    return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
};

export const generateContentWithRetry =
    async (gemini, request, attempts = 2) => {

        const models = [
            request.model,
            "gemini-3.5-flash-lite",
            "gemini-2.5-flash-lite"
        ].filter((model, index, values) =>
            model && values.indexOf(model) === index
        );

        let lastError;

        for (const model of models) {

            for (let attempt = 1; attempt <= attempts; attempt++) {

                try {
                    return await gemini.models.generateContent({
                        ...request,
                        model
                    });
                } catch (error) {

                    lastError = error;

                    if (!isTransientGeminiError(error)) {
                        throw error;
                    }

                    if (attempt < attempts) {
                        await new Promise(resolve =>
                            setTimeout(resolve, attempt * 1500)
                        );
                    }
                }
            }
        }

        throw lastError || new Error("Gemini generation failed for all configured models");
    };