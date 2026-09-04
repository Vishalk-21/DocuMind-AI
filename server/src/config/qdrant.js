import { QdrantClient }
    from "@qdrant/js-client-rest";

const qdrant = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
    port: 443,
    https: true
});

export default qdrant;