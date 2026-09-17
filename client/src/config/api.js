const rawApiUrl = import.meta.env.VITE_API_URL?.trim();

const apiOrigin = rawApiUrl || "http://localhost:5000";
let parsedApiOrigin;

try {
    parsedApiOrigin = new URL(apiOrigin);
} catch {
    parsedApiOrigin = null;
}

const isMailServerUrl = parsedApiOrigin && (
    parsedApiOrigin.port === "465" ||
    parsedApiOrigin.port === "587" ||
    parsedApiOrigin.hostname.startsWith("smtp.")
);

export const apiConfigurationError = import.meta.env.PROD && (
    !rawApiUrl
        ? "VITE_API_URL is missing in the production frontend deployment. Set it to the public HTTP(S) URL of the backend."
        : !parsedApiOrigin || !["http:", "https:"].includes(parsedApiOrigin.protocol)
            ? "VITE_API_URL is invalid. Set it to the public HTTP(S) URL of the backend."
            : isMailServerUrl
                ? "VITE_API_URL points to an email server. Set it to the public HTTP(S) URL of the backend, not SMTP_HOST or port 587."
                : ""
);

export const API_URL = `${apiOrigin.replace(/\/$/, "")}/api`;

export const apiConnectionMessage = () => {
    if (apiConfigurationError) {
        return apiConfigurationError;
    }

    return `Cannot reach the API at ${apiOrigin}. Check that the backend is running and that VITE_API_URL on Vercel is the public backend URL.`;
};
