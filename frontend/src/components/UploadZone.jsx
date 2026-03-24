import { useRef, useState, useCallback } from "react";

export default function UploadZone({ file, onFile }) {
  const fileRef = useRef();
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }, [onFile]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => fileRef.current.click()}
      style={{
        border: `1.5px dashed ${dragOver ? "rgba(167,139,250,0.6)" : file ? "rgba(110,231,183,0.4)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: 12, padding: "22px 16px", textAlign: "center",
        cursor: "pointer", transition: "all 0.2s",
        background: dragOver ? "rgba(139,92,246,0.06)" : file ? "rgba(16,185,129,0.04)" : "rgba(255,255,255,0.02)",
      }}
    >
      <input ref={fileRef} type="file" accept=".pdf,.txt" style={{ display: "none" }} onChange={(e) => onFile(e.target.files[0])} />
      {file ? (
        <>
          <div style={{ fontSize: 24, marginBottom: 6 }}>📄</div>
          <div style={{ color: "#6ee7b7", fontWeight: 600, fontSize: 13 }}>{file.name}</div>
          <div style={{ color: "#3a4060", fontSize: 11, marginTop: 4 }}>Click to change</div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 24, marginBottom: 8, opacity: 0.5 }}>⬆</div>
          <div style={{ color: "#4a5580", fontSize: 13 }}>Drop resume or <span style={{ color: "#a78bfa" }}>browse</span></div>
          <div style={{ color: "#2a3050", fontSize: 11, marginTop: 4 }}>PDF · TXT</div>
        </>
      )}
    </div>
  );
}
