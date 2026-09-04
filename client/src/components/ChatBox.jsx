import {
    useEffect,
    useRef,
    useState
} from "react";
import { ArrowUp, Bot, Sparkles } from "lucide-react";

import Message from "./Message";
import { askQuestion } from "../services/api";

function ChatBox({
    documentId,
    documentName,
    chatId,
    initialMessages = [],
    onChatUpdated
}) {

    const [messages, setMessages] = useState(initialMessages);
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const sendMessage = async () => {

        if (!question.trim() || loading) return;

        const currentQuestion = question.trim();

        setMessages(prev => [
            ...prev,
            { role: "user", content: currentQuestion }
        ]);
        setQuestion("");
        setLoading(true);

        try {
            const response = await askQuestion({
                documentId,
                chatId,
                question: currentQuestion,
                recentMessages: messages.slice(-10)
            });

            setMessages(prev => [
                ...prev,
                { role: "assistant", content: response.answer }
            ]);

            onChatUpdated?.({
                chatId: response.chatId,
                title: currentQuestion,
                documentId,
                messages: response.messages
            });
        } catch (error) {
            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    content: error.message === "Gemini API quota exhausted. Please wait for the quota to reset or enable billing."
                        ? error.message
                        : `Sorry, I could not process your question.\n\n${error.message}`
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <div>
                    <div className="assistant-badge"><Sparkles size={14} /> DocuMind AI</div>
                    <span className="chat-caption">{documentName} · Source-grounded conversation</span>
                </div>
                <div className="chat-model"><Bot size={15} /> Hybrid retrieval</div>
            </div>

            <div className="chat-messages">
                {messages.length === 0 && (
                    <div className="empty-chat">
                        <div className="empty-chat-icon"><Sparkles size={20} /></div>
                        <h2>Ask anything about your PDF</h2>
                        <p>Ask for a summary, a specific fact, or a connection between ideas.</p>
                    </div>
                )}

                {messages.map((message, index) => (
                    <Message key={`${message.role}-${index}`} message={message} />
                ))}

                {loading && (
                    <div className="typing">
                        <span className="typing-dots"><i /><i /><i /></span>
                        Searching your document...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input">
                <input
                    value={question}
                    disabled={loading}
                    onChange={event => setQuestion(event.target.value)}
                    onKeyDown={event => {
                        if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            sendMessage();
                        }
                    }}
                    placeholder={loading ? "Waiting for answer..." : "Ask anything about this PDF..."}
                />
                <button onClick={sendMessage} disabled={loading || !question.trim()} aria-label="Send question">
                    <ArrowUp size={18} />
                </button>
            </div>
        </div>
    );
}

export default ChatBox;