import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { verifyUserOtp } from "../services/authApi";

const API_URL = `${(import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "")}/api`;

const VerifyOtp = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const { email, purpose = "login" } = location.state || {};
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [message, setMessage] = useState("");

    const handleChange = (index, value) => {
        const next = [...otp];
        next[index] = value.replace(/\D/g, "").slice(0, 1);
        setOtp(next);

        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const code = otp.join("");
        if (code.length !== 6) {
            alert("Enter the full 6-digit OTP");
            return;
        }

        setLoading(true);

        try {
            const result = await verifyUserOtp({ email, otp: code }, purpose);

            if (purpose === "register") {
                alert("Account verified successfully. Please log in.");
                navigate("/login", { replace: true });
                return;
            }

            setUser(result.user);
            navigate("/workspace", { replace: true });
        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const resend = async () => {
        setResending(true);
        setMessage("");
        try {
            const response = await fetch(`${API_URL}/auth/resend-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, purpose })
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result?.error?.message || result?.message || "Could not resend OTP");
            setOtp(["", "", "", "", "", ""]);
            setMessage("A new OTP was sent. Use the newest code from your email.");
        } catch (error) {
            setMessage(error.message);
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="auth-shell">
            <div className="auth-card">
                <h1>Verify your email</h1>
                <p>Enter the 6-digit code sent to your email.</p>
                {message && <p className={message.startsWith("A new") ? "success-message" : "error-message"}>{message}</p>}
                <form onSubmit={handleSubmit} className="otp-form">
                    <div className="otp-grid">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                id={`otp-${index}`}
                                value={digit}
                                maxLength={1}
                                onChange={(event) => handleChange(index, event.target.value)}
                                inputMode="numeric"
                            />
                        ))}
                    </div>
                    <button type="submit" disabled={loading}>{loading ? "Verifying..." : "Verify"}</button>
                </form>
                <button type="button" className="auth-link-button" onClick={resend} disabled={resending}>{resending ? "Sending..." : "Resend code"}</button>
            </div>
        </div>
    );
};

export default VerifyOtp;
