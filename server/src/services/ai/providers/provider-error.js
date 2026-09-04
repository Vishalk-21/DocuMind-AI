export const getProviderErrorType = (error) => {

    const status =
        error?.status ||
        error?.statusCode ||
        error?.response?.status;


    if (status === 429) {
        return "RATE_LIMIT";
    }


    if (
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504
    ) {
        return "TEMPORARY";
    }


    if (status === 401) {
        return "AUTH";
    }


    if (status === 403) {
        return "FORBIDDEN";
    }


    if (status === 400) {
        return "BAD_REQUEST";
    }


    return "UNKNOWN";
};