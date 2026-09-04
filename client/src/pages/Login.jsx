import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authApi";

const Login = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        setForm({ ...form, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            const result = await loginUser(form);

            navigate("/verify-otp", { state: { email: form.email, purpose: result.purpose || "login" } });
        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-shell">
            <div className="auth-card">
                <h1>DocuMind AI</h1>
                <h2>Welcome back</h2>
                <form onSubmit={handleSubmit} className="auth-form">
                    <label>Email
                        <input name="email" type="email" value={form.email} onChange={handleChange} required />
                    </label>
                    <label>Password
                        <input name="password" type="password" value={form.password} onChange={handleChange} required />
                    </label>
                    <button type="submit" disabled={loading}>{loading ? "Signing in..." : "Continue"}</button>
                </form>
                <p>
                    Don’t have an account? <Link to="/register">Register</Link>
                </p>
                <p><Link to="/forgot-password">Forgot password?</Link></p>
            </div>
        </div>
    );
};

export default Login;
