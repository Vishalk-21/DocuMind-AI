import { useEffect, useMemo, useState } from "react";
import { FileText, Maximize2, X } from "lucide-react";

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"];
const TEXT_EXTENSIONS = ["txt", "md", "markdown", "csv", "rtf", "html", "htm", "xml", "json", "log"];
const OFFICE_EXTENSIONS = ["doc", "docx", "xls", "xlsx", "ppt", "pptx", "odt", "ods", "odp", "epub"];
const API_URL = `${(import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "")}/api`;

function DocumentPreview({ file, fileName, documentId, onClose }) {

    const extension = fileName?.split(".").pop()?.toLowerCase() || "";
    const isImage = IMAGE_EXTENSIONS.includes(extension);
    const isTextFile = TEXT_EXTENSIONS.includes(extension);
    const isOfficeFile = OFFICE_EXTENSIONS.includes(extension);
    const shouldUseFrame = !isImage && !isTextFile && !isOfficeFile;

    const [textPreview, setTextPreview] = useState("");
    const [officePreview, setOfficePreview] = useState("");
    const [previewError, setPreviewError] = useState("");

    const fileUrl =
        useMemo(
            () => file ? URL.createObjectURL(file) : "",
            [file]
        );

    useEffect(() => {

        let isMounted = true;

        const readTextFile = async () => {
            if (!file || !isTextFile) {
                setTextPreview("");
                return;
            }

            try {
                const text = await file.text();
                if (isMounted) {
                    setTextPreview(text.slice(0, 20000));
                }
            } catch {
                if (isMounted) {
                    setTextPreview("");
                }
            }
        };

        const loadOfficePreview = async () => {
            if (!documentId || !isOfficeFile) {
                setOfficePreview("");
                setPreviewError("");
                return;
            }

            try {
                const response = await fetch(`${API_URL}/documents/${documentId}/preview`, { credentials: "include" });
                const result = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(result?.message || "Preview unavailable");
                }

                if (isMounted) {
                    setOfficePreview(result.text || "");
                    setPreviewError("");
                }
            } catch (error) {
                if (isMounted) {
                    setOfficePreview("");
                    setPreviewError(error.message || "Preview unavailable for this file type.");
                }
            }
        };

        readTextFile();
        loadOfficePreview();

        return () => {
            isMounted = false;
            if (fileUrl) URL.revokeObjectURL(fileUrl);
        };

    }, [documentId, file, fileUrl, isOfficeFile, isTextFile]);

    const previewTitle = isImage
        ? `${fileName} image preview`
        : isTextFile
            ? `${fileName} text preview`
            : `${fileName} document preview`;

    return (
        <section className="pdf-panel">
            <div className="pdf-panel-header">
                <div>
                    <span className="section-kicker">DOCUMENT PREVIEW</span>
                    <strong>{fileName}</strong>
                </div>
                <div className="pdf-actions">
                    <a
                        className="icon-button"
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Open document in a new tab"
                        download={fileName}
                    >
                        <Maximize2 size={16} />
                    </a>
                    <button
                        className="icon-button"
                        onClick={onClose}
                        title="Close document preview"
                        aria-label="Close document preview"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
            <div className="pdf-frame-wrap">
                {fileUrl ? (
                    isImage ? (
                        <div className="pdf-frame-wrap">
                            <img
                                src={fileUrl}
                                alt={fileName}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                    display: "block",
                                    background: "#f4f6fb"
                                }}
                            />
                        </div>
                    ) : isTextFile ? (
                        <div style={{ padding: 18, height: "100%", overflow: "auto", background: "#f7f9ff" }}>
                            <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 13, lineHeight: 1.6, color: "#1f2430" }}>
                                {textPreview || "No text content is available for this file."}
                            </pre>
                        </div>
                    ) : isOfficeFile ? (
                        <div style={{ padding: 18, height: "100%", overflow: "auto", background: "#f7f9ff" }}>
                            {previewError ? (
                                <div style={{ color: "#58657b", fontSize: 13, lineHeight: 1.6 }}>
                                    {previewError}
                                </div>
                            ) : (
                                <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 13, lineHeight: 1.6, color: "#1f2430" }}>
                                    {officePreview || "Extracting document content for preview..."}
                                </pre>
                            )}
                        </div>
                    ) : shouldUseFrame ? (
                        <iframe
                            className="pdf-frame"
                            src={fileUrl}
                            title={previewTitle}
                        />
                    ) : (
                        <div className="pdf-empty">
                            <FileText size={28} />
                            <span>Preview unavailable for this file type</span>
                        </div>
                    )
                ) : (
                    <div className="pdf-empty">
                        <FileText size={28} />
                        <span>Document preview unavailable</span>
                    </div>
                )}
            </div>
            {!isImage && !isTextFile && isOfficeFile && (
                <div style={{ padding: "0 16px 16px", color: "#58657b", fontSize: 12, textAlign: "center" }}>
                    Office files are opened in the browser when possible. If your browser cannot render them, use the open button above.
                </div>
            )}
        </section>
    );
}

export default DocumentPreview;