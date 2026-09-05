import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/dashboard.css";

const API_URL = `${(import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "")}/api`;

export default function Account() {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    const [name, setName] = useState(user?.name || "");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const request = async () => {
        setLoading(true); setError(""); setMessage("");
        try {
            const response = await fetch(`${API_URL}/user/password/request`, { method: "POST", credentials: "include" });
            const result = await response.json();
            if (!response.ok) throw new Error(result?.error?.message || "Could not send verification code");
            setMessage(result.message);
        } catch (requestError) { setError(requestError.message); } finally { setLoading(false); }
    };

    const saveName = async (event) => {
        event.preventDefault(); setLoading(true); setError(""); setMessage("");
        try {
            const response = await fetch(`${API_URL}/user/profile`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ name }) });
            const result = await response.json();
            if (!response.ok) throw new Error(result?.error?.message || "Could not update profile");
            setUser(result.user); setMessage("Profile updated successfully");
        } catch (requestError) { setError(requestError.message); } finally { setLoading(false); }
    };

    const changePassword = async (event) => {
        event.preventDefault(); setLoading(true); setError(""); setMessage("");
        try {
            const response = await fetch(`${API_URL}/user/password/change`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ otp, password }) });
            const result = await response.json();
            if (!response.ok) throw new Error(result?.error?.message || "Could not change password");
            setOtp(""); setPassword(""); setMessage("Password changed successfully");
        } catch (requestError) { setError(requestError.message); } finally { setLoading(false); }
    };

    const logout = async () => {
        await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" }).catch(error => console.error(error));
        setUser(null);
        navigate("/", { replace: true });
    };

    return <div className="dashboard-container account-page">
        <div className="dashboard-header"><div><p className="section-kicker">ACCOUNT</p><h1>Account settings</h1></div><div className="account-actions"><button className="logout-btn" onClick={() => navigate("/workspace")}>Back to workspace</button><button className="logout-btn" onClick={logout}>Log out</button></div></div>
        <div className="dashboard-content">
            <section className="profile-section"><h2>Personal details</h2><form className="auth-form" onSubmit={saveName}><label>Name<input value={name} onChange={event => setName(event.target.value)} required /></label><label>Email<input value={user?.email || ""} disabled readOnly /></label><button type="submit" disabled={loading}>Save name</button></form></section>
            <section className="profile-section"><h2>Change password</h2><p>A verification code will be sent to your account email.</p><button className="tab-btn" type="button" onClick={request} disabled={loading}>Send email verification</button><form className="auth-form" onSubmit={changePassword}><label>Email OTP<input inputMode="numeric" maxLength={6} value={otp} onChange={event => setOtp(event.target.value.replace(/\D/g, ""))} required /></label><label>New password<input type="password" minLength={8} value={password} onChange={event => setPassword(event.target.value)} required /></label><button type="submit" disabled={loading}>Change password</button></form></section>
            {message && <p className="success-message">{message}</p>}{error && <p className="error-message">{error}</p>}
            <p><Link to="/workspace">Return to workspace</Link></p>
        </div>
    </div>;
}
