import { useNavigate } from "react-router-dom";

export default function FinalCTA() {
  const navigate = useNavigate();

  return (
    <section className="final-cta">
      <div className="final-cta-content">
        <h2>Your documents contain the answers.</h2>
        <p>DocuMind helps you find them. Get started in seconds.</p>
        <div className="final-cta-buttons">
          <button className="btn btn-primary" onClick={() => navigate("/register")}>
            Get Started
          </button>
          <button className="btn btn-secondary" onClick={() => navigate("/login")}>
            Sign In
          </button>
        </div>
      </div>
    </section>
  );
}
