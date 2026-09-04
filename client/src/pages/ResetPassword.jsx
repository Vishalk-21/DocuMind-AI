import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { resetUserPassword } from "../services/authApi";

export default function ResetPassword() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [form, setForm] = useState({ otp: "", password: "", confirmPassword: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await resetUserPassword({ email: state?.email, otp: form.otp, password: form.password });
            navigate("/login", { replace: true });
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    };

    return <div className="auth-shell"><div className="auth-card">
        <h1>Choose a new password</h1><p>Enter the OTP sent to {state?.email || "your email"}.</p>
        {!state?.email && <p className="error-message">Start from the forgot password page so we know which account to update.</p>}
        <form onSubmit={submit} className="auth-form">
            <label>OTP<input inputMode="numeric" maxLength={6} value={form.otp} onChange={event => setForm({ ...form, otp: event.target.value.replace(/\D/g, "") })} required /></label>
            <label>New password<input type="password" minLength={8} value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} required /></label>
            <label>Confirm password<input type="password" minLength={8} value={form.confirmPassword} onChange={event => setForm({ ...form, confirmPassword: event.target.value })} required /></label>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" disabled={loading || !state?.email}>{loading ? "Updating..." : "Update password"}</button>
        </form>
        <p><Link to="/login">Back to login</Link></p>
    </div></div>;
}
