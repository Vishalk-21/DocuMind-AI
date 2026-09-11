const rawApiUrl = import.meta.env.VITE_API_URL?.trim();

// Never silently send a production browser back to a developer's localhost.
// Vite replaces VITE_API_URL while building the Vercel deployment.
if (!rawApiUrl && import.meta.env.PROD) {
    throw new Error("VITE_API_URL is not configured for this deployment.");
}

export const API_URL = `${(rawApiUrl || "http://localhost:5000").replace(/\/$/, "")}/api`;

export const apiConnectionMessage = () => {
    const apiOrigin = API_URL.replace(/\/api$/, "");
    return `Cannot reach the API at ${apiOrigin}. Check VITE_API_URL on Vercel and that the Render service is running.`;
};
