import { useState } from "react";
import { FileUp, UploadCloud } from "lucide-react";
import { uploadPDF } from "../services/api";

const supportedExtensions = [
    ".pdf", ".docx", ".pptx", ".xlsx", ".odt", ".odp", ".ods",
    ".rtf", ".txt", ".csv", ".md", ".markdown", ".html", ".htm", ".epub"
];

const supportedFileTypes = supportedExtensions.join(",");

function UploadBox({ onUploaded }) {

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [dragging, setDragging] =
        useState(false);

    const handleUpload =
        async (event) => {

            const file =
                event.target.files[0];

            await uploadFile(file);
        };

    const uploadFile =
        async (file) => {

            if (!file) return;

            const extension = `.${file.name.split(".").pop().toLowerCase()}`;

            if (!supportedExtensions.includes(extension)) {
                setError("This file type is not supported.");
                return;
            }

            setError("");
            setLoading(true);

            try {

                const result =
                    await uploadPDF(file);

                onUploaded(
                    result.document,
                    file
                );

            } catch (error) {

                console.error(error);

                setError(
                    error.response?.data?.error ||
                    error.response?.data?.message ||
                    "File upload failed. Check that the backend is running."
                );

            } finally {

                setLoading(false);
            }
        };

    return (
        <div className="upload-section">

            <div className="welcome-copy">
                <span className="section-kicker">PRIVATE DOCUMENT AI</span>
                <h2>Turn a document into a conversation.</h2>
                <p>Upload a file and keep every answer grounded in its content.</p>
            </div>

            <div
                className={`upload-zone ${dragging ? "dragging" : ""} ${loading ? "is-loading" : ""}`}
                onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                    event.preventDefault();
                    setDragging(false);
                    uploadFile(event.dataTransfer.files[0]);
                }}
            >
                <div className="upload-orbit"><UploadCloud size={25} /></div>
                <div>
                    <h3>{loading ? "Reading your document" : "Drop your PDF here"}</h3>
                    <p>{loading ? "Extracting, indexing, and preparing your workspace" : "or browse from your computer"}</p>
                </div>
                <label className="browse-button">
                    <FileUp size={16} /> Browse files
                    <input type="file" accept={supportedFileTypes} onChange={handleUpload} disabled={loading} />
                </label>
                <span className="upload-meta">PDF, Office, text and web files <i /> Up to 20 MB</span>
            </div>

            {error && (
                <p className="inline-error" role="alert">
                    {error}
                </p>
            )}

        </div>
    );
}

export default UploadBox;