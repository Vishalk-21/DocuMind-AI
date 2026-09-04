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

    await connectDB();
    try {
        await verifyMailTransport();
    } catch (error) {
        console.error(`SMTP verification failed: ${error.message}`);
    }

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();