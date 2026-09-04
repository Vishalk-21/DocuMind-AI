import { FileText, MessageSquare, Search, Network, Zap, Clock, Copy, Router } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: MessageSquare,
      title: "AI PDF Chat",
      description: "Ask natural questions about your document and get instant, intelligent responses."
    },
    {
      icon: FileText,
      title: "Source References",
      description: "Every answer comes with citations showing exactly where information came from."
    },
    {
      icon: Search,
      title: "OCR Technology",
      description: "Understand scanned PDF pages and handwritten documents with advanced OCR."
    },
    {
      icon: Network,
      title: "Semantic Search",
      description: "Find relevant information based on meaning, not just keyword matching."
    },
    {
      icon: Zap,
      title: "Knowledge Graph",
      description: "Connect important entities and relationships within your documents."
    },
    {
      icon: Clock,
      title: "Conversation Memory",
      description: "Continue your conversation without losing context or previous insights."
    },
    {
      icon: Copy,
      title: "Duplicate Detection",
      description: "Previously processed documents can be reused, saving time and resources."
    },
    {
      icon: Router,
      title: "Multi-Model AI",
      description: "Multiple AI providers power different workloads for optimal performance."
    }
  ];

  return (
    <section className="features" id="features">
      <div className="features-content">
        <div className="section-header">
          <h2>Powerful Features</h2>
          <p>Everything you need to work intelligently with documents.</p>
        </div>

        <div className="features-grid">
          {features.map((feature, idx) => (
            <div key={idx} className="feature-card">
              <div className="feature-icon">
                <feature.icon size={24} style={{ color: "#4F46E5" }} />
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
