export default function UseCases() {
  const useCases = [
    {
      emoji: "🎓",
      title: "Students",
      description: "Understand study material and ask questions without searching through every page."
    },
    {
      emoji: "🔬",
      title: "Researchers",
      description: "Explore papers and find relevant information across hundreds of documents."
    },
    {
      emoji: "💼",
      title: "Professionals",
      description: "Ask questions about reports, manuals and documents instantly."
    },
    {
      emoji: "👨‍💻",
      title: "Developers",
      description: "Understand documentation and codebase information through natural questions."
    },
    {
      emoji: "👥",
      title: "Teams",
      description: "Collaborate on documents with shared understanding and instant answers."
    }
  ];

  return (
    <section className="use-cases" id="use-cases">
      <div className="use-cases-content">
        <div className="section-header">
          <h2>Who Uses DocuMind</h2>
          <p>DocuMind works for anyone who needs to understand documents faster.</p>
        </div>

        <div className="use-cases-grid">
          {useCases.map((useCase, idx) => (
            <div key={idx} className="use-case-card">
              <div className="use-case-icon">{useCase.emoji}</div>
              <h3>{useCase.title}</h3>
              <p>{useCase.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
