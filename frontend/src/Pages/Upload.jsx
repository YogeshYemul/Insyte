import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import "../styles/upload.css";

function formatBytes(bytes) {
  if (bytes == null || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function Upload() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const applyFile = useCallback((f) => {
    if (!f) return;
    const name = f.name?.toLowerCase() ?? "";
    if (!name.endsWith(".csv")) {
      setError("Please choose a file with a .csv extension.");
      return;
    }
    setFile(f);
    setError("");
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    applyFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    applyFile(f);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const clearFile = () => {
    setFile(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file before running the pipeline.");
      return;
    }

    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const text = await response.text();
      let result = {};
      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        setError("The server returned an invalid response.");
        return;
      }

      if (!response.ok) {
        let msg = `Request failed (${response.status})`;
        if (typeof result.detail === "string") msg = result.detail;
        else if (Array.isArray(result.detail))
          msg = result.detail.map((d) => (typeof d === "string" ? d : d.msg || "")).join(" ");
        setError(msg);
        return;
      }

      if (result.dataset_summary && result.dataset_summary.error) {
        setError(String(result.dataset_summary.error));
        return;
      }

      navigate("/result", {
        state: { edaReport: result, fileName: file.name },
      });
    } catch (err) {
      console.error("Upload failed:", err);
      setError(
        "Could not reach the API. Start the backend (uvicorn) and check VITE_API_URL in frontend/.env matches the server port."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="upload-wrapper">
      <div className="upload-bg" aria-hidden>
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
      </div>

      <div className="upload-container">
        <header className="upload-header">
          <h1>Upload Dataset</h1>
          <p>
            Drop a CSV here or tap to browse — then run the EDA pipeline.
          </p>
        </header>

        <div
          className={`upload-zone ${dragOver ? "dragover" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          role="presentation"
        >
          <input
            ref={inputRef}
            id="file-input"
            type="file"
            accept=".csv,text/csv,text/plain"
            onChange={handleFileChange}
            disabled={isLoading}
          />
          <label htmlFor="file-input" className="upload-label">
            <span className="upload-icon" aria-hidden>
              📁
            </span>
            <div className="upload-text">
              <span className="upload-main">Choose CSV file</span>
              <span className="upload-sub">or drag and drop into this area</span>
            </div>
          </label>
        </div>

        {file && (
          <div className="file-info">
            <div className="file-icon" aria-hidden>
              📄
            </div>
            <div className="file-details">
              <div className="file-name">{file.name}</div>
              <div className="file-size">{formatBytes(file.size)}</div>
            </div>
            <button
              type="button"
              className="remove-file"
              onClick={clearFile}
              disabled={isLoading}
              aria-label="Remove file"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="error-banner" role="alert">
            <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          className="upload-btn"
          onClick={handleUpload}
          disabled={!file || isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner-small" aria-hidden />
              Running EDA pipeline…
            </>
          ) : (
            <>Run EDA pipeline</>
          )}
        </button>

        <div className="features-info">
          <div className="info-card">
            <span className="info-icon">🔒</span>
            <span>Processed on your server</span>
          </div>
          <div className="info-card">
            <span className="info-icon">📊</span>
            <span>Full EDA report</span>
          </div>
        </div>
      </div>
    </div>
  );
}
