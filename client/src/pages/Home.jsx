import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FileText,
    LayoutDashboard,
    LibraryBig,
    LogOut,
    Plus,
    Sparkles
} from "lucide-react";

import UploadBox from "../components/UploadBox";
import ProcessingStatus from "../components/ProcessingStatus";
import ChatBox from "../components/ChatBox";
import DocumentPreview from "../components/PdfViewer";
import { useDocumentStatus } from "../hooks/useDocumentStatus";
import { getChat, getRecentChats } from "../services/api";
import { useAuth } from "../context/AuthContext";

function Home() {

    const [documentId, setDocumentId] = useState(null);
    const [documentFile, setDocumentFile] = useState(null);
    const [recentDocuments, setRecentDocuments] = useState([]);
    const [recentChats, setRecentChats] = useState([]);
    const [chatId, setChatId] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatSelectionVersion, setChatSelectionVersion] = useState(0);
    const [showPreview, setShowPreview] = useState(true);
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const document = useDocumentStatus(documentId);

    useEffect(() => {
        getRecentChats()
            .then(result => setRecentChats(result.chats))
            .catch(error => console.error(error));
    }, []);

    const handleNewDocument = () => {
        setDocumentId(null);
        setDocumentFile(null);
        setChatId(null);
        setChatMessages([]);
        setShowPreview(true);
    };

    const handleLogout = async () => {
        await fetch("http://localhost:5000/api/auth/logout", {
            method: "POST",
            credentials: "include"
        }).catch(error => console.error(error));
        setUser(null);
        navigate("/", { replace: true });
    };

    const handleChatSelect = async (chat) => {
        try {
            const result = await getChat(chat.chatId);
            setChatId(result.chat.chatId);
            setChatMessages(result.chat.messages);
            setDocumentId(result.chat.documentId);
            setChatSelectionVersion(version => version + 1);
        } catch (error) {
            console.error(error);
        }
    };

    const handleChatUpdated = (chat) => {
        setChatId(chat.chatId);
        setChatMessages(chat.messages || []);
        setRecentChats(chats => [
            chat,
            ...chats.filter(item => item.chatId !== chat.chatId)
        ]);
    };

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div className="brand">
                    <span className="brand-mark"><Sparkles size={16} /></span>
                    <span>DocuMind</span>
                </div>
                <button className="new-document" onClick={handleNewDocument}>
                    <Plus size={17} /> New document
                </button>
                <nav className="sidebar-nav" aria-label="Main navigation">
                    <span className="nav-item active"><LayoutDashboard size={17} /> Dashboard</span>
                    <span className="nav-item"><LibraryBig size={17} /> Documents</span>
                </nav>

                <div className="recent-documents">
                    <span className="sidebar-label">RECENT DOCUMENTS</span>
                    {recentDocuments.length === 0 && <span className="recent-empty">Your library is empty</span>}
                    {recentDocuments.map(item => (
                        <button className={`recent-document ${item.documentId === documentId ? "selected" : ""}`} key={item.documentId} onClick={() => {
                            setDocumentId(item.documentId);
                            setDocumentFile(item.file);
                        }}>
                            <FileText size={15} /><span>{item.fileName}</span>
                        </button>
                    ))}
                </div>

                <div className="recent-chats">
                    <span className="sidebar-label">RECENT CHATS</span>
                    {recentChats.length === 0 && <span className="recent-empty">No conversations yet</span>}
                    {recentChats.map(chat => (
                        <button className={`recent-chat ${chat.chatId === chatId ? "selected" : ""}`} key={chat.chatId} onClick={() => handleChatSelect(chat)}>
                            <Sparkles size={14} /><span>{chat.title}</span>
                        </button>
                    ))}
                </div>

                <button className="sidebar-footer" onClick={() => navigate("/account")}>
                    <div className="profile-avatar">{user?.name?.charAt(0).toUpperCase() || "U"}</div>
                    <div><strong>{user?.name || "Account"}</strong><span>{user?.email || "Personal library"}</span></div>
                </button>
            </aside>

            <main className="main-content">
                <header className="topbar">
                    <div>
                        <span className="eyebrow">DOCUMENT WORKSPACE</span>
                        <h1>{document ? document.fileName : "Your knowledge, in focus"}</h1>
                    </div>
                    <div className="topbar-actions">
                        <div className="topbar-status"><span /> AI workspace online</div>
                        <button className="workspace-logout" onClick={handleLogout} title="Log out" aria-label="Log out"><LogOut size={17} /></button>
                    </div>
                </header>

                {!documentId && (
                    <UploadBox onUploaded={(uploadedDocument, file) => {
                        setDocumentId(uploadedDocument.documentId);
                        setDocumentFile(file);
                        setRecentDocuments(documents => [{
                            documentId: uploadedDocument.documentId,
                            fileName: uploadedDocument.fileName,
                            file
                        }, ...documents.filter(item => item.documentId !== uploadedDocument.documentId)]);
                    }} />
                )}

                {document && document.status !== "completed" && document.status !== "failed" && (
                    <section className="workspace-stage fade-in">
                        <div className="stage-heading"><span className="section-kicker">PROCESSING</span><span className="live-dot">Live</span></div>
                        <ProcessingStatus status={document.status} progress={document.progress} message={document.statusMessage} />
                    </section>
                )}

                {document?.status === "failed" && (
                    <div className="failure-card fade-in">
                        <span className="section-kicker">PROCESSING ERROR</span>
                        <h2>PDF processing failed</h2>
                        <p>{document.error}</p>
                    </div>
                )}

                {document?.status === "completed" && (
                    <section className={`chat-stage fade-in ${showPreview ? "" : "chat-expanded"}`}>
                        <div className="document-strip">
                            <div className="document-icon"><FileText size={19} /></div>
                            <div><strong>{document.fileName}</strong><span><span className="ready-dot" /> Ready to explore</span></div>
                        </div>
                        <div className={`workspace-grid ${showPreview ? "" : "chat-only"}`}>
                            {showPreview && (
                                <DocumentPreview
                                    file={documentFile}
                                    fileName={document.fileName}
                                    documentId={document.documentId}
                                    onClose={() => setShowPreview(false)}
                                />
                            )}
                            <ChatBox
                                key={`${document.documentId}-${chatSelectionVersion}`}
                                documentId={document.documentId}
                                documentName={document.fileName}
                                chatId={chatId}
                                initialMessages={chatMessages}
                                onChatUpdated={handleChatUpdated}
                            />
                        </div>
                        {!showPreview && (
                            <button className="show-pdf-button" onClick={() => setShowPreview(true)}>
                                <FileText size={16} /> Show document preview
                            </button>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
}

export default Home;