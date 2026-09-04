import Groq from "groq-sdk";

let groq = null;

// Only initialize Groq if API key is set
if (process.env.GROQ_API_KEY) {
    try {
        groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });
    } catch (err) {
        console.warn("Warning: Failed to initialize Groq provider:", err.message);
        groq = null;
    }
} else {
    console.log("Note: GROQ_API_KEY not set, Groq provider disabled");
}

export default groq;