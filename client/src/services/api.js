import { API_URL, getAuthHeaders } from "../config/api";

export const uploadPDF = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_URL}/documents/upload`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: formData
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "PDF upload failed");
    }

    return response.json();
};

export const getDocumentStatus = async (documentId) => {
    const response = await fetch(`${API_URL}/documents/${documentId}/status`, {
        credentials: "include",
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error("Failed to get document status");
    }

    return response.json();
};

export const getDocumentPreview = async (documentId) => {
    const response = await fetch(`${API_URL}/documents/${documentId}/preview`, {
        credentials: "include",
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Preview unavailable");
    }

    return response.json();
};

export const askQuestion = async ({ documentId, chatId, question }) => {
    const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders()
        },
        body: JSON.stringify({
            documentId,
            chatId,
            question
        })
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to get answer");
    }

    return response.json();
};

export const getRecentChats = async (documentId) => {
    const query = documentId
        ? `?documentId=${encodeURIComponent(documentId)}`
        : "";

    const response = await fetch(`${API_URL}/chat/recent${query}`, {
        credentials: "include",
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error("Failed to get recent chats");
    }

    return response.json();
};

export const getChat = async (chatId) => {
    const response = await fetch(`${API_URL}/chat/${chatId}`, {
        credentials: "include",
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error("Failed to get chat history");
    }

    return response.json();
};