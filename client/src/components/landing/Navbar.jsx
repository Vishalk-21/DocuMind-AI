import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleScroll = (id) => {
    setMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-logo">
          DocuMind AI
        </Link>

        <ul className={`navbar-menu ${menuOpen ? "active" : ""}`}>
          <li><a href="#features" onClick={(e) => { e.preventDefault(); handleScroll("features"); }}>Features</a></li>
          <li><a href="#how-it-works" onClick={(e) => { e.preventDefault(); handleScroll("how-it-works"); }}>How it works</a></li>
          <li><a href="#use-cases" onClick={(e) => { e.preventDefault(); handleScroll("use-cases"); }}>Use cases</a></li>
          <li><a href="#security" onClick={(e) => { e.preventDefault(); handleScroll("security"); }}>Security</a></li>
        </ul>

        <div className="navbar-actions">
          <button onClick={() => navigate("/login")} className="btn btn-secondary">Sign In</button>
          <button onClick={() => navigate("/register")} className="btn btn-primary">Get Started</button>
        </div>

        <button 
          className="navbar-menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
}
