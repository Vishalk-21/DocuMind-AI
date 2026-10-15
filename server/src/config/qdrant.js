import { QdrantClient } from "@qdrant/js-client-rest";

const qdrantUrl = process.env.QDRANT_URL?.trim().replace(/\/$/, "");

let qdrant = null;

if (qdrantUrl) {
    try {
        qdrant = new QdrantClient({
            url: qdrantUrl,
            apiKey: process.env.QDRANT_API_KEY,
            checkCompatibility: false
        });
    } catch (err) {
        console.warn("Failed to initialize Qdrant client:", err.message);
        qdrant = null;
    }
} else {
    console.log("Note: QDRANT_URL not set, Qdrant vector provider disabled (using MongoDB chunk fallback)");
}

export default qdrant;