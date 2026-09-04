import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginAdmin } from "../services/authApi";

export default function AdminLogin() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const submit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        try {
            const result = await loginAdmin(form);
            navigate("/admin/verify-otp", { state: { email: result.email } });
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    };

    return <div className="auth-shell"><div className="auth-card">
        <h1>DocuMind AI</h1><h2>Admin Portal</h2><p>Authorized administrators only.</p>
        <form onSubmit={submit} className="auth-form">
            <label>Email<input type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} required /></label>
            <label>Password<input type="password" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} required /></label>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" disabled={loading}>{loading ? "Sending OTP..." : "Continue"}</button>
        </form>
        <p><Link to="/">Back to website</Link></p>
    </div></div>;
}
