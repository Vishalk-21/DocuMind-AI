import { Lock, Mail, Shield, Users, Zap, AlertCircle } from "lucide-react";

export default function SecuritySection() {
  const features = [
    {
      icon: Lock,
      title: "Secure Authentication",
      description: "Industry-standard authentication and session management."
    },
    {
      icon: Mail,
      title: "Email Verification",
      description: "Verify your identity with OTP-based email verification."
    },
    {
      icon: Shield,
      title: "Protected Sessions",
      description: "Your sessions are protected with secure cookie-based authentication."
    },
    {
      icon: Users,
      title: "Private Ownership",
      description: "Your documents are private and only accessible to you."
    },
    {
      icon: Zap,
      title: "Role-Based Access",
      description: "Granular access control with role-based permissions."
    },
    {
      icon: AlertCircle,
      title: "Rate Limiting",
      description: "Protected against abuse with intelligent rate limiting."
    }
  ];

  return (
    <section className="security" id="security">
      <div className="security-content">
        <div className="section-header">
          <h2>Your Documents Deserve a Secure Workspace</h2>
          <p>Built with security and privacy at every level.</p>
        </div>

        <div className="security-grid">
          {features.map((feature, idx) => (
            <div key={idx} className="security-item">
              <div className="security-icon">
                <feature.icon size={32} style={{ color: "#4F46E5" }} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
