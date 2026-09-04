import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotUserPassword } from "../services/authApi";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const submit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        try {
            await forgotUserPassword(email.trim().toLowerCase());
            navigate("/reset-password", { state: { email: email.trim().toLowerCase() } });
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    };

    return <div className="auth-shell"><div className="auth-card">
        <h1>Reset password</h1><p>We will send a one-time code to your email.</p>
        <form onSubmit={submit} className="auth-form">
            <label>Email<input type="email" value={email} onChange={event => setEmail(event.target.value)} required /></label>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" disabled={loading}>{loading ? "Sending..." : "Send OTP"}</button>
        </form>
        <p><Link to="/login">Back to login</Link></p>
    </div></div>;
}
