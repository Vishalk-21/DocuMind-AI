export default function ProductDemo() {
  return (
    <section className="product-demo">
      <div className="product-demo-content">
        <div className="section-header">
          <h2>See DocuMind in Action</h2>
          <p>Real example of how DocuMind answers questions grounded in your documents.</p>
        </div>

        <div className="demo-container">
          <div className="demo-pdf">
            <div className="demo-pdf-header">📄 Light Reflection and Refraction</div>
            <div className="demo-pdf-content">
              <p>Physics Textbook</p>
            </div>
          </div>

          <div className="demo-chat">
            <div className="demo-message user">
              <p>What is the mirror formula?</p>
            </div>

            <div className="demo-message ai">
              <p><strong>Mirror Formula</strong></p>
              <p>The mirror formula is:</p>
              <p style={{ fontSize: "14px", fontFamily: "monospace", marginTop: "8px" }}>1/f = 1/u + 1/v</p>
              <div className="demo-citation">📌 Page 4</div>
            </div>

            <div className="demo-message user">
              <p>When is this formula applicable?</p>
            </div>

            <div className="demo-message ai">
              <p>This formula applies to spherical mirrors (both concave and convex) when:</p>
              <p>• The object is placed in front of the mirror</p>
              <p>• Light obeys the laws of reflection</p>
              <p>• The aperture of the mirror is small</p>
              <div className="demo-citation">📌 Page 5</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
