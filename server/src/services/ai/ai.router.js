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
                name: "groq",
                model: getModel("GROQ_CHAT_MODEL", "qwen/qwen3.8-27b")
            },

            {
                name: "gemini",
                model: getModel("GEMINI_CHAT_MODEL", "gemini-2.0-flash")
            },

            {
                name: "cerebras",
                model: getModel("CEREBRAS_CHAT_MODEL", "qwen-3.8-27b")
            }
        ]
    },


    summary: {
        providers: [
            {
                name: "groq",
                model: getModel("GROQ_SUMMARY_MODEL", "qwen/qwen3.8-27b")
            },

            {
                name: "gemini",
                model: getModel("GEMINI_SUMMARY_MODEL", "gemini-2.0-flash")
            },

            {
                name: "cerebras",
                model: getModel("CEREBRAS_SUMMARY_MODEL", "qwen-3.8-27b")
            }
        ]
    },


    graph: {
        providers: [
            {
                name: "groq",
                model: getModel("GROQ_GRAPH_MODEL", "qwen/qwen3.8-27b")
            },

            {
                name: "cerebras",
                model: getModel("CEREBRAS_GRAPH_MODEL", "qwen-3.8-27b")
            },

            {
                name: "gemini",
                model: getModel("GEMINI_GRAPH_MODEL", "gemini-2.0-flash")
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
            // PERMANENT / CONFIG ERRORS
            // ============================================

            if (
                errorType === "AUTH" ||
                errorType === "FORBIDDEN" ||
                errorType === "BAD_REQUEST"
            ) {

                console.warn(
                    `Non-retryable error from ${provider.name}. Marking unavailable and trying next provider: ${error.message}`
                );

                markProviderFailure(
                    provider.name,
                    5 * 60 * 1000
                );

                continue;
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