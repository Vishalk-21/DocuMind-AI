import neo4j from "neo4j-driver";

let driver = null;

// Only initialize Neo4j if required credentials are set
if (process.env.NEO4J_URI && process.env.NEO4J_USERNAME && process.env.NEO4J_PASSWORD) {
    try {
        driver = neo4j.driver(
            process.env.NEO4J_URI,
            neo4j.auth.basic(
                process.env.NEO4J_USERNAME,
                process.env.NEO4J_PASSWORD
            )
        );
    } catch (err) {
        console.warn("Warning: Failed to initialize Neo4j driver:", err.message);
        driver = null;
    }
} else {
    console.log("Note: Neo4j credentials not set, Neo4j provider disabled");
}

export default driver;