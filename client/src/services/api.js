const API_URL = `${import.meta.env.VITE_API_URL}/api`;
export const uploadPDF =
    async (file) => {

        const formData =
            new FormData();

        formData.append(
            "file",
            file
        );

        const response =
            await fetch(
                `${API_URL}/documents/upload`,
                {
                    method: "POST",
                    body: formData
                }
            );

        if (!response.ok) {

            const error =
                await response.json().catch(() => ({}));

            throw new Error(
                error.message ||
                "PDF upload failed"
            );
        }

        return response.json();
    };


// ========================================
// Get PDF processing status
// ========================================

export const getDocumentStatus =
    async (documentId) => {

        const response =
            await fetch(
                `${API_URL}/documents/${documentId}/status`
            );

        if (!response.ok) {

            throw new Error(
                "Failed to get document status"
            );
        }

        return response.json();
    };


// ========================================
// Ask question about PDF
// ========================================

export const askQuestion =
    async ({
        documentId,
        chatId,
        question
    }) => {

        const response =
            await fetch(
                `${API_URL}/chat`,
                {
                    method: "POST",

                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        documentId,

                        chatId,

                        question

                    })
                }
            );


        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || "Failed to get answer");
        }


        return response.json();
    };

export const getRecentChats =
    async (documentId) => {

        const query =
            documentId
                ? `?documentId=${encodeURIComponent(documentId)}`
                : "";

        const response =
            await fetch(
                `${API_URL}/chat/recent${query}`,
                { credentials: "include" }
            );

        if (!response.ok) {
            throw new Error("Failed to get recent chats");
        }

        return response.json();
    };

export const getChat =
    async (chatId) => {

        const response =
            await fetch(
                `${API_URL}/chat/${chatId}`,
                { credentials: "include" }
            );

        if (!response.ok) {
            throw new Error("Failed to get chat history");
        }

        return response.json();
    };