import { API_URL, apiConnectionMessage } from "../config/api";
const request = async (path, options = {}) => {
    let response;
    try {
        response = await fetch(`${API_URL}${path}`, {
            ...options,
            headers: { "Content-Type": "application/json", ...options.headers },
            credentials: "include"
        });
    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error(apiConnectionMessage(), { cause: error });
        }
        throw error;
    }

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(result?.error?.message || result?.message || "Authentication request failed");
    }
    return result;
};

export const loginUser = (data) => request("/auth/login", { method: "POST", body: JSON.stringify(data) });
export const registerUser = (data) => request("/auth/register", { method: "POST", body: JSON.stringify(data) });
export const verifyUserOtp = (data, purpose) => request(purpose === "register" ? "/auth/verify-email" : "/auth/verify-login-otp", { method: "POST", body: JSON.stringify(data) });
export const forgotUserPassword = (email) => request("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
export const resetUserPassword = (data) => request("/auth/reset-password", { method: "POST", body: JSON.stringify(data) });
export const loginAdmin = (data) => request("/admin/auth/login", { method: "POST", body: JSON.stringify(data) });
export const verifyAdminOtp = (data) => request("/admin/auth/verify-otp", { method: "POST", body: JSON.stringify(data) });
