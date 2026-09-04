import {
    generateAI
} from "./ai.service.js";


import {
    getProviderErrorType
} from "./provider-error.js";


import {
    markProviderFailure,
    markProviderHealthy,
    isProviderAvailable
} from "./provider-health.js";


// ======================================================
// AI TASK CONFIGURATION
// ======================================================

const getModel = (envName, fallback) => process.env[envName] || fallback;

const TASK_CONFIG = {

    chat: {
        providers: [
            {
                name: "gemini",
                model: getModel("GEMINI_CHAT_MODEL", "gemini-3.6-flash")
            },

            {
                name: "groq",
                model: getModel("GROQ_CHAT_MODEL", "llama-3.3-70b-versatile")
            },

            {
                name: "cerebras",
                model: getModel("CEREBRAS_CHAT_MODEL", "llama3.1-8b")
            }
        ]
    },


    summary: {
        providers: [
            {
                name: "cerebras",
                model: getModel("CEREBRAS_SUMMARY_MODEL", "llama3.1-8b")
            },

            {
                name: "gemini",
                model: getModel("GEMINI_SUMMARY_MODEL", "gemini-3.6-flash")
            },

            {
                name: "groq",
                model: getModel("GROQ_SUMMARY_MODEL", "llama-3.3-70b-versatile")
            }
        ]
    },


    graph: {
        providers: [
            {
                name: "groq",
                model: getModel("GROQ_GRAPH_MODEL", "llama-3.3-70b-versatile")
            },

            {
                name: "cerebras",
                model: getModel("CEREBRAS_GRAPH_MODEL", "llama3.1-8b")
            },

            {
                name: "gemini",
                model: getModel("GEMINI_GRAPH_MODEL", "gemini-3.6-flash")
            }
        ]
    }

};


// ======================================================
// MAIN AI ROUTER
// ======================================================

export const routeAI = async ({
    task,
    prompt,
    temperature = 0.2
}) => {

    const config =
        TASK_CONFIG[task];


    // --------------------------------------------------
    // Check whether task exists
    // --------------------------------------------------

    if (!config) {

        throw new Error(
            `Unknown AI task: ${task}`
        );
    }


    let lastError = null;


    // ==================================================
    // TRY PROVIDERS IN PRIORITY ORDER
    // ==================================================

    for (const provider of config.providers) {

        // ------------------------------------------------
        // Check provider health
        // ------------------------------------------------

        if (
            !isProviderAvailable(
                provider.name
            )
        ) {

            console.log(
                `Skipping unavailable provider: ${provider.name}`
            );

            continue;
        }


        try {

            console.log(
                `Trying AI provider: ${provider.name}`
            );


            // ============================================
            // CALL PROVIDER
            // ============================================

            const response =
                await generateAI({

                    provider:
                        provider.name,

                    prompt,

                    model:
                        provider.model,

                    temperature

                });


            // ============================================
            // PROVIDER SUCCESS
            // ============================================

            markProviderHealthy(
                provider.name
            );


            console.log(
                `AI provider succeeded: ${provider.name}`
            );


            return response;


        } catch (error) {

            // ============================================
            // SAVE ERROR
            // ============================================

            lastError = error;


            // ============================================
            // IDENTIFY ERROR TYPE
            // ============================================

            const errorType =
                getProviderErrorType(error);


            console.error(
                `AI provider failed: ${provider.name}`,
                {
                    type: errorType,
                    message: error.message
                }
            );


            // ============================================
            // PERMANENT ERRORS
            // ============================================

            if (
                errorType === "AUTH" ||
                errorType === "FORBIDDEN" ||
                errorType === "BAD_REQUEST"
            ) {

                console.error(
                    `Non-retryable error from ${provider.name}`
                );


                throw error;
            }


            // ============================================
            // TEMPORARY / RATE LIMIT ERROR
            // ============================================

            if (
                errorType === "RATE_LIMIT" ||
                errorType === "TEMPORARY"
            ) {

                markProviderFailure(
                    provider.name,
                    60 * 1000
                );

            }


            // ============================================
            // TRY NEXT PROVIDER
            // ============================================

            console.log(
                `Trying next AI provider...`
            );

            continue;
        }
    }


    // ==================================================
    // ALL PROVIDERS FAILED
    // ==================================================

    throw new Error(
        `All AI providers failed. Last error: ${
            lastError?.message ||
            "Unknown error"
        }`
    );
};