let cerebras = null;

try {
    const CerebrasModule = await import("cerebras-cloud-sdk");
    const Cerebras = CerebrasModule.default || CerebrasModule;

    if (Cerebras && process.env.CEREBRAS_API_KEY) {
        cerebras = new Cerebras({
            apiKey: process.env.CEREBRAS_API_KEY
        });
    }
} catch (error) {
    console.warn("Cerebras SDK not installed; Cerebras provider is disabled.");
}

export default cerebras;