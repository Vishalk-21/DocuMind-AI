import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "../.env");

dotenv.config({ path: envPath });

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    const { default: app } = await import("./app.js");
    const { default: connectDB } = await import("./config/db.js");
    const { verifyMailTransport } = await import("./config/mail.js");

    // Connect to database first
    await connectDB();

    // Start HTTP server immediately after DB connection
    // Do not make Render wait for SMTP verification.
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on port ${PORT}`);
    });

    // Check SMTP in the background
    try {
        await verifyMailTransport();
    } catch (error) {
        console.error(`SMTP verification failed: ${error.message}`);
        console.error("Server will continue running, but email/OTP may not work.");
    }
};

startServer();