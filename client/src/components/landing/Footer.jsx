import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-grid">
          <div className="footer-section">
            <div className="footer-logo">DocuMind AI</div>
            <p style={{ fontSize: "13px", marginBottom: "16px", color: "rgba(255, 255, 255, 0.7)" }}>
              Transform your documents into intelligent assistants.
            </p>
          </div>

          <div className="footer-section">
            <h3>Product</h3>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#use-cases">Use Cases</a></li>
              <li><a href="#security">Security</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Resources</h3>
            <ul>
              <li><a href="/">Documentation</a></li>
              <li><a href="/">Blog</a></li>
              <li><a href="/">Support</a></li>
              <li><a href="/">Status</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Legal</h3>
            <ul>
              <li><a href="/">Privacy Policy</a></li>
              <li><a href="/">Terms of Service</a></li>
              <li><a href="/">Cookie Policy</a></li>
              <li><a href="/">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <div>© 2026 DocuMind AI. All rights reserved.</div>
          <div className="footer-legal">
            <a href="/">Privacy</a>
            <a href="/">Terms</a>
            <a href="/">Contact</a>
          </div>
        </div>
        <div className="footer-admin-link"><Link to="/admin/login">Admin Portal</Link></div>
      </div>
    </footer>
  );
}
