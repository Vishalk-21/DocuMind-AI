export default function HowItWorks() {
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="how-it-works-content">
        <div className="section-header">
          <h2>How DocuMind Works</h2>
          <p>Four simple steps to transform your documents into intelligent assistants.</p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number-large">01</div>
            <h3>Upload</h3>
            <p>Upload your PDF document in seconds. We support all standard PDF formats, including scanned documents.</p>
            <span className="step-connector">→</span>
          </div>

          <div className="step-card">
            <div className="step-number-large">02</div>
            <h3>Understand</h3>
            <p>DocuMind extracts text, processes scanned pages with OCR, creates embeddings, and understands relationships inside your document.</p>
            <span className="step-connector">→</span>
          </div>

          <div className="step-card">
            <div className="step-number-large">03</div>
            <h3>Ask</h3>
            <p>Ask questions using natural language. Anything from specific facts to complex analysis of your documents.</p>
            <span className="step-connector">→</span>
          </div>

          <div className="step-card">
            <div className="step-number-large">04</div>
            <h3>Explore</h3>
            <p>Get grounded answers with relevant page references. Understand exactly where each answer comes from in your document.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
