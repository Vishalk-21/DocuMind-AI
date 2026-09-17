import { QdrantClient } from "@qdrant/js-client-rest";

const qdrantUrl = process.env.QDRANT_URL?.trim().replace(/\/$/, "");

if (!qdrantUrl) {
    throw new Error("QDRANT_URL is required. Set it to the public Qdrant Cloud HTTPS URL.");
}

const qdrant = new QdrantClient({
    url: qdrantUrl,
    apiKey: process.env.QDRANT_API_KEY
});

export default qdrant;