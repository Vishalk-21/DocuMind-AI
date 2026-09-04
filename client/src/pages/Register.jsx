import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authApi";

const Register = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        setForm({ ...form, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            await registerUser(form);

            navigate("/verify-otp", { state: { email: form.email, purpose: "register" } });
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
                <h2>Create account</h2>
                <form onSubmit={handleSubmit} className="auth-form">
                    <label>Name
                        <input name="name" value={form.name} onChange={handleChange} required />
                    </label>
                    <label>Email
                        <input name="email" type="email" value={form.email} onChange={handleChange} required />
                    </label>
                    <label>Password
                        <input name="password" type="password" value={form.password} onChange={handleChange} required />
                    </label>
                    <button type="submit" disabled={loading}>{loading ? "Creating..." : "Register"}</button>
                </form>
                <p>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
