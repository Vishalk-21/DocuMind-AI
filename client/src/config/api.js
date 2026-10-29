const cleanedApiUrl = (import.meta.env.VITE_API_URL || "")
    .replace(/^[\uFEFF\u200B\s]+|[\uFEFF\u200B\s]+$/g, "")
    .trim();

const normalizedApiUrl = cleanedApiUrl && !cleanedApiUrl.startsWith("http://") && !cleanedApiUrl.startsWith("https://")
    ? `https://${cleanedApiUrl}`
    : cleanedApiUrl;

const defaultOrigin = import.meta.env.PROD ? "https://documind-ai-2-q7wh.onrender.com" : "http://localhost:5000";
const apiOrigin = normalizedApiUrl || defaultOrigin;

let parsedApiOrigin;
try {
    parsedApiOrigin = new URL(apiOrigin);
} catch {
    try {
        parsedApiOrigin = new URL(defaultOrigin);
    } catch {
        parsedApiOrigin = null;
    }
}

const isMailServerUrl = parsedApiOrigin && (
    parsedApiOrigin.port === "465" ||
    parsedApiOrigin.port === "587" ||
    parsedApiOrigin.hostname.startsWith("smtp.")
);

export const apiConfigurationError = isMailServerUrl
    ? "VITE_API_URL points to an email server. Set it to the public HTTP(S) URL of the backend, not SMTP_HOST or port 587."
    : "";

export const API_URL = `${apiOrigin.replace(/\/$/, "")}/api`;

export const apiConnectionMessage = () => {
    if (apiConfigurationError) {
        return apiConfigurationError;
    }

    return `Cannot reach the API at ${apiOrigin}. Check that the backend is running and that VITE_API_URL on Vercel is the public backend URL.`;
};

export const getAuthHeaders = (headers = {}) => {
    const token = localStorage.getItem("documind_token");
    const authHeaders = { ...headers };
    if (token) {
        authHeaders["Authorization"] = `Bearer ${token}`;
    }
    return authHeaders;
};

export const authFetch = async (url, options = {}) => {
    const headers = getAuthHeaders(options.headers || {});
    return fetch(url, {
        ...options,
        headers,
        credentials: "include"
    });
};
