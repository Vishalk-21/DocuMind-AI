import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/dashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [chats, setChats] = useState([]);
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashRes, usersRes, docsRes, chatsRes, usageRes] = await Promise.all([
        fetch("http://localhost:5000/api/admin/dashboard", { credentials: "include" }),
        fetch("http://localhost:5000/api/admin/users", { credentials: "include" }),
        fetch("http://localhost:5000/api/admin/documents", { credentials: "include" }),
        fetch("http://localhost:5000/api/admin/chats", { credentials: "include" }),
        fetch("http://localhost:5000/api/admin/usage", { credentials: "include" })
      ]);

      if (!dashRes.ok || !usersRes.ok || !docsRes.ok || !chatsRes.ok || !usageRes.ok) {
        throw new Error("Failed to fetch admin data");
      }

      const dashData = await dashRes.json();
      const usersData = await usersRes.json();
      const docsData = await docsRes.json();
      const chatsData = await chatsRes.json();
      const usageData = await usageRes.json();

      setDashboard(dashData.data);
      setUsers(usersData.users || []);
      setDocuments(docsData.documents || []);
      setChats(chatsData.chats || []);
      setUsage(usageData.usage || []);
    } catch (err) {
      setError(err.message);
      if (err.message.includes("403")) {
        navigate("/user/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="dashboard-loading">Loading...</div>;

  return (
    <div className="dashboard-container admin">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button className="logout-btn" onClick={() => {
          fetch("http://localhost:5000/api/auth/logout", { method: "POST", credentials: "include" }).finally(() => {
            setUser(null);
            navigate("/", { replace: true });
          });
        }}>
          Logout
        </button>
      </div>

      {dashboard && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{dashboard.totalUsers}</div>
            <div className="stat-sub">Active: {dashboard.activeUsers}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Documents</div>
            <div className="stat-value">{dashboard.documents}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Chats</div>
            <div className="stat-value">{dashboard.chats}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Requests</div>
            <div className="stat-value">{dashboard.requests}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Tokens</div>
            <div className="stat-value">{Number(dashboard.totalTokens || 0).toLocaleString()}</div>
          </div>
        </div>
      )}

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          Users ({users.length})
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
        <button
          className={`tab-btn ${activeTab === "usage" ? "active" : ""}`}
          onClick={() => setActiveTab("usage")}
        >
          Usage ({usage.length})
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-content">
        {activeTab === "overview" && (
          <div className="overview-section">
            <h2>System Overview</h2>
            <p>Welcome to the DocuMind Admin Panel. Monitor your system metrics, users, and usage statistics.</p>
          </div>
        )}

        {activeTab === "users" && (
          <div className="users-section">
            <h2>Registered Users</h2>
            {users.length === 0 ? (
              <p className="empty-state">No users found</p>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Verified</th>
                      <th>Active</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td><span className="role-badge">{user.role}</span></td>
                        <td>{user.isEmailVerified ? "✓" : "✗"}</td>
                        <td>{user.isActive ? "✓" : "✗"}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
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
            <h2>All Documents</h2>
            {documents.length === 0 ? (
              <p className="empty-state">No documents found</p>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>File Name</th>
                      <th>User ID</th>
                      <th>Type</th>
                      <th>Pages</th>
                      <th>Size (KB)</th>
                      <th>Uploaded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc._id}>
                        <td>{doc.fileName}</td>
                        <td>{doc.userId}</td>
                        <td>{doc.fileType}</td>
                        <td>{doc.pageCount || "N/A"}</td>
                        <td>{(doc.fileSize / 1024).toFixed(2)}</td>
                        <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "chats" && (
          <div className="chats-section">
            <h2>All Chats</h2>
            {chats.length === 0 ? (
              <p className="empty-state">No chats found</p>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Document ID</th>
                      <th>Messages</th>
                      <th>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chats.map((chat) => (
                      <tr key={chat._id}>
                        <td>{chat.userId}</td>
                        <td>{chat.documentId}</td>
                        <td>{chat.messages?.length || 0}</td>
                        <td>{new Date(chat.updatedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "usage" && (
          <div className="usage-section">
            <h2>Usage Statistics</h2>
            {usage.length === 0 ? (
              <p className="empty-state">No usage records</p>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Provider</th>
                      <th>Task</th>
                      <th>Tokens</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usage.map((record, idx) => (
                      <tr key={idx}>
                        <td>{record.userId}</td>
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
      </div>
    </div>
  );
}
