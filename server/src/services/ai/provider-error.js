const normalizeStatus = (error) => {
    const status = error?.status ?? error?.statusCode ?? error?.response?.status ?? error?.cause?.status;

    if (typeof status === "number") {
        return status;
    }

    if (typeof status === "string" && /^\d+$/.test(status)) {
        return Number(status);
    }

    return null;
};

const normalizeMessage = (error) => {
    const message =
        error?.message ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.cause?.message ||
        "";

    return String(message).toLowerCase();
};

export const getProviderErrorType = (error) => {
    const status = normalizeStatus(error);
    const message = normalizeMessage(error);

    if (status === 401 || message.includes("unauthorized") || message.includes("api key") || message.includes("auth")) {
        return "AUTH";
    }

    if (status === 403 || message.includes("forbidden") || message.includes("permission denied")) {
        return "FORBIDDEN";
    }

    if (status === 400 || message.includes("bad request") || message.includes("invalid request") || message.includes("model not found")) {
        return "BAD_REQUEST";
    }

    if (status === 429 || message.includes("rate limit") || message.includes("too many requests") || message.includes("quota exceeded")) {
        return "RATE_LIMIT";
    }

    if (
        status === 408 ||
        status === 425 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504 ||
        message.includes("timeout") ||
        message.includes("temporarily unavailable") ||
        message.includes("network") ||
        message.includes("connection") ||
        message.includes("fetch failed")
    ) {
        return "TEMPORARY";
    }

    if (message.includes("overloaded") || message.includes("server error") || message.includes("unavailable")) {
        return "TEMPORARY";
    }

    return "UNKNOWN";
};
