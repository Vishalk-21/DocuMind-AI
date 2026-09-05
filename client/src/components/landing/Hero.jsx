import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-text">
          <h1>Turn your documents into knowledge.</h1>
          <p>Upload PDFs, ask questions, explore the information inside them, and get grounded answers with source references.</p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={() => navigate("/register")}>
              Try DocuMind
            </button>
            <button className="btn btn-secondary" onClick={() => {
              document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
            }}>
              See how it works
            </button>
          </div>
        </div>

        <div className="hero-preview">
          <div className="preview-card">
            <div className="preview-header">📄 Product Preview</div>
            <div className="preview-split">
              <div className="preview-left">
                <div style={{ fontWeight: 600, fontSize: "12px", color: "#475569", marginBottom: "16px" }}>Your Documents</div>
                <div className="document-item">📄 Physics.pdf</div>
                <div className="document-item">📄 Research.pdf</div>
                <div className="document-item">📄 Company_Report.pdf</div>
              </div>

              <div className="preview-right">
                <div>
                  <div style={{ fontWeight: 600, fontSize: "12px", color: "#475569", marginBottom: "16px" }}>Ask DocuMind</div>
                  <div className="question-box">What is refraction?</div>
                </div>

                <div className="answer-box">
                  <div className="answer-title">🧠 Refraction</div>
                  <div className="answer-text">
                    Refraction is the bending of light when it passes from one medium to another with a different optical density.
                  </div>
                  <div className="answer-citation">📌 Page 4</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
