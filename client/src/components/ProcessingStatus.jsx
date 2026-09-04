function ProcessingStatus({
    status,
    progress,
    message
}) {

    const steps = [
        {
            key: "extracting",
            label: "Extracting PDF content"
        },
        {
            key: "classifying",
            label: "Analyzing document"
        },
        {
            key: "ocr",
            label: "Reading scanned pages"
        },
        {
            key: "cleaning",
            label: "Cleaning content"
        },
        {
            key: "chunking",
            label: "Preparing document sections"
        },
        {
            key: "embedding",
            label: "Creating semantic embeddings"
        },
        {
            key: "vector_indexing",
            label: "Building semantic search"
        },
        {
            key: "graph_indexing",
            label: "Building document relationships"
        },
        {
            key: "completed",
            label: "Document ready"
        }
    ];

    const statusOrder = [
        "uploaded",
        "extracting",
        "classifying",
        "ocr",
        "cleaning",
        "chunking",
        "embedding",
        "vector_indexing",
        "graph_indexing",
        "completed"
    ];

    const currentIndex =
        statusOrder.indexOf(status);


    return (
        <div className="processing-card">

            <div className="processing-visual">
                <div className="processing-ring"><span /></div>
                <span className="processing-percent">{progress}%</span>
            </div>

            <div className="processing-copy">
                <h2>Building your document workspace</h2>
                <p>{message}</p>
            </div>

            <div className="progress-track">

                <div
                    className="progress-fill"
                    style={{
                        width: `${progress}%`
                    }}
                />

            </div>

            <div className="processing-steps">

                {steps.map((step) => {

                    const stepIndex =
                        statusOrder.indexOf(
                            step.key
                        );

                    const completed =
                        stepIndex < currentIndex;

                    const active =
                        stepIndex === currentIndex;

                    return (
                        <div
                            key={step.key}
                            className={`
                                processing-step
                                ${completed ? "completed" : ""}
                                ${active ? "active" : ""}
                            `}
                        >

                            <span className="step-icon">

                                {completed
                                    ? "✓"
                                    : active
                                        ? "●"
                                        : "○"
                                }

                            </span>

                            <span className="step-label">
                                {step.label}
                            </span>

                        </div>
                    );

                })}

            </div>

        </div>
    );
}

export default ProcessingStatus;