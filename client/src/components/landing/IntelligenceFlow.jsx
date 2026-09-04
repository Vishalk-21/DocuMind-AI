export default function IntelligenceFlow() {
  return (
    <section className="intelligence-flow">
      <div className="intelligence-flow-content">
        <div className="section-header">
          <h2>Document Intelligence Pipeline</h2>
          <p>Advanced processing layers that make DocuMind work.</p>
        </div>

        <div className="flow-diagram">
          <div className="flow-item">
            <div className="flow-box">📄 PDF</div>
            <div className="flow-arrow">↓</div>
          </div>

          <div className="flow-item">
            <div className="flow-box">Text Extraction</div>
            <div className="flow-arrow">↓</div>
          </div>

          <div className="flow-item">
            <div className="flow-sub-boxes">
              <div className="flow-sub-box">Text Extraction</div>
              <div className="flow-sub-box">OCR Engine</div>
            </div>
            <div className="flow-arrow">↓</div>
          </div>

          <div className="flow-item">
            <div className="flow-box">Chunking</div>
            <div className="flow-arrow">↓</div>
          </div>

          <div className="flow-item">
            <div className="flow-sub-boxes">
              <div className="flow-sub-box">Embeddings</div>
              <div className="flow-sub-box">Knowledge Graph</div>
            </div>
            <div className="flow-arrow">↓</div>
          </div>

          <div className="flow-item">
            <div className="flow-sub-boxes">
              <div className="flow-sub-box">🔍 Qdrant</div>
              <div className="flow-sub-box">📊 Neo4j</div>
            </div>
            <div className="flow-arrow">↓</div>
          </div>

          <div className="flow-item">
            <div className="flow-box">Retrieval Augmented Generation</div>
            <div className="flow-arrow">↓</div>
          </div>

          <div className="flow-item">
            <div className="flow-box">AI Router</div>
            <div className="flow-arrow">↓</div>
          </div>

          <div className="flow-item">
            <div className="flow-sub-boxes">
              <div className="flow-sub-box">Gemini</div>
              <div className="flow-sub-box">Groq</div>
              <div className="flow-sub-box">Cerebras</div>
            </div>
            <div className="flow-arrow">↓</div>
          </div>

          <div className="flow-item">
            <div className="flow-box">✨ Grounded Answer</div>
          </div>
        </div>
      </div>
    </section>
  );
}
