import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { verifyAdminOtp } from "../services/authApi";

export default function AdminVerifyOtp() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        try {
            const result = await verifyAdminOtp({ email: state?.email, otp });
            setUser(result.user);
            navigate("/admin/dashboard", { replace: true });
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    };

    return <div className="auth-shell"><div className="auth-card">
        <h1>Verify Admin Login</h1><p>Enter the code sent to your admin email.</p>
        <form onSubmit={submit} className="auth-form">
            <label>6-digit OTP<input inputMode="numeric" maxLength={6} value={otp} onChange={event => setOtp(event.target.value.replace(/\D/g, ""))} required /></label>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" disabled={loading}>{loading ? "Verifying..." : "Verify"}</button>
        </form>
    </div></div>;
}
