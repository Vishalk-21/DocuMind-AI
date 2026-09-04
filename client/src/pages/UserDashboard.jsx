import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/dashboard.css";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [usage, setUsage] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [profileRes, usageRes, docsRes, chatsRes] = await Promise.all([
        fetch("/api/user/profile", { credentials: "include" }),
        fetch("/api/user/usage", { credentials: "include" }),
        fetch("/api/user/documents", { credentials: "include" }),
        fetch("/api/user/chats", { credentials: "include" })
      ]);

      if (!profileRes.ok || !usageRes.ok || !docsRes.ok || !chatsRes.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const profileData = await profileRes.json();
      const usageData = await usageRes.json();
      const docsData = await docsRes.json();
      const chatsData = await chatsRes.json();

      setProfile(profileData.user);
      setUsage(usageData.usage || []);
      setDocuments(docsData.documents || []);
      setChats(chatsData.chats || []);
    } catch (err) {
      setError(err.message);
      if (err.message.includes("401") || err.message.includes("unauthorized")) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="dashboard-loading">Loading...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>User Dashboard</h1>
        <button className="logout-btn" onClick={() => {
          fetch("http://localhost:5000/api/auth/logout", { method: "POST", credentials: "include" }).finally(() => {
            setUser(null);
            navigate("/", { replace: true });
          });
        }}>
          Logout
        </button>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
        <button
          className={`tab-btn ${activeTab === "usage" ? "active" : ""}`}
          onClick={() => setActiveTab("usage")}
        >
          Usage ({usage.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "documents" ? "active" : ""}`}
          onClick={() => setActiveTab("documents")}
        >
          Documents ({documents.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "chats" ? "active" : ""}`}
          onClick={() => setActiveTab("chats")}
        >
          Chats ({chats.length})
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-content">
        {activeTab === "profile" && profile && (
          <div className="profile-section">
            <h2>Profile Information</h2>
            <div className="profile-grid">
              <div className="profile-item">
                <label>Name</label>
                <p>{profile.name}</p>
              </div>
              <div className="profile-item">
                <label>Email</label>
                <p>{profile.email}</p>
              </div>
              <div className="profile-item">
                <label>Role</label>
                <p className="role-badge">{profile.role}</p>
              </div>
              <div className="profile-item">
                <label>Email Verified</label>
                <p>{profile.isEmailVerified ? "✓ Yes" : "✗ No"}</p>
              </div>
              <div className="profile-item">
                <label>Account Status</label>
                <p>{profile.isActive ? "Active" : "Inactive"}</p>
              </div>
              <div className="profile-item">
                <label>Last Login</label>
                <p>{profile.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : "N/A"}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "usage" && (
          <div className="usage-section">
            <h2>Usage History</h2>
            {usage.length === 0 ? (
              <p className="empty-state">No usage records yet</p>
            ) : (
              <div className="table-responsive">
                <table className="usage-table">
                  <thead>
                    <tr>
                      <th>Provider</th>
                      <th>Task</th>
                      <th>Tokens</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usage.map((record, idx) => (
                      <tr key={idx}>
                        <td>{record.provider}</td>
                        <td>{record.task}</td>
                        <td>{record.totalTokens}</td>
                        <td>{new Date(record.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "documents" && (
          <div className="documents-section">
            <h2>My Documents</h2>
            {documents.length === 0 ? (
              <p className="empty-state">No documents uploaded yet</p>
            ) : (
              <div className="documents-grid">
                {documents.map((doc) => (
                  <div key={doc._id} className="document-card">
                    <div className="doc-header">
                      <h3>{doc.fileName}</h3>
                      <span className="file-size">{(doc.fileSize / 1024).toFixed(2)} KB</span>
                    </div>
                    <div className="doc-meta">
                      <p><strong>Type:</strong> {doc.fileType}</p>
                      <p><strong>Pages:</strong> {doc.pageCount || "N/A"}</p>
                      <p><strong>Uploaded:</strong> {new Date(doc.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "chats" && (
          <div className="chats-section">
            <h2>Recent Chats</h2>
            {chats.length === 0 ? (
              <p className="empty-state">No chats yet</p>
            ) : (
              <div className="chats-list">
                {chats.map((chat) => (
                  <div key={chat._id} className="chat-item">
                    <div className="chat-header">
                      <h3>{chat.documentId}</h3>
                      <span className="message-count">{chat.messages?.length || 0} messages</span>
                    </div>
                    <p className="chat-updated">Updated: {new Date(chat.updatedAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
