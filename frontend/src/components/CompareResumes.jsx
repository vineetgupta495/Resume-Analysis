import { useRef, useState } from "react";
import { useCompareResumes } from "../hooks/useCompareResumes";

export default function CompareResumes({ onSaveHistory }) {
  const { jobPrompt, setJobPrompt, files, addFiles, removeFile, results, loading, error, progress, analyzeAll, reset } = useCompareResumes();

  // Auto-save to history when comparison completes
  const [lastSaved, setLastSaved] = useState(0);
  if (results.length > 0 && onSaveHistory && results.length !== lastSaved) {
    setLastSaved(results.length);
    onSaveHistory({ type: "compare", jobPrompt, files: results.map(r => ({ name: r.name })), results });
  }
  const fileRef = useRef();
  const [dragOver, setDragOver] = useState(false);
  // Always derive verdict from score
  const getVerdict = s => s >= 8.5 ? "Highly Recommended" : s >= 6.5 ? "Recommended" : s >= 4.0 ? "Borderline" : "Not Recommended";
  const best = results[0] ? { ...results[0], verdict: getVerdict(results[0].score) } : null;

  const scoreColor = s => s >= 8 ? "#6ee7b7" : s >= 6 ? "#fbbf24" : s >= 4 ? "#fb923c" : "#f87171";
  const barGrad = s => s >= 8 ? "linear-gradient(90deg,#059669,#6ee7b7)" : s >= 6 ? "linear-gradient(90deg,#d97706,#fbbf24)" : s >= 4 ? "linear-gradient(90deg,#ea580c,#fb923c)" : "linear-gradient(90deg,#dc2626,#f87171)";
  const verdictC = v => v === "Highly Recommended" ? ["rgba(110,231,183,0.1)","rgba(110,231,183,0.25)","#6ee7b7"] : v === "Recommended" ? ["rgba(99,102,241,0.1)","rgba(99,102,241,0.25)","#818cf8"] : v === "Borderline" ? ["rgba(251,191,36,0.1)","rgba(251,191,36,0.25)","#fbbf24"] : ["rgba(248,113,113,0.1)","rgba(248,113,113,0.25)","#f87171"];
  const pill = v => { const [bg,b,c] = verdictC(v); return { display:"inline-flex", alignItems:"center", gap:5, padding:"3px 12px", borderRadius:100, background:bg, border:`1px solid ${b}`, color:c, fontSize:11, fontWeight:600 }; };

  return (
    <div style={{ padding: "24px 28px" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: "#5b6a9a", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Multi Resume Mode</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "#f0eeff" }}>Compare Resumes</h2>
      </div>

      {/* Input */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={card}>
          <div style={hdr}><span style={dot("#a78bfa")} /><span style={lbl}>Job Requirement</span></div>
          <input value={jobPrompt} onChange={e => setJobPrompt(e.target.value)}
            placeholder="e.g., Python, React, Node.js..."
            style={inp}
            onFocus={e => { e.target.style.borderColor = "rgba(167,139,250,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.1)"; }}
            onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.06)"; e.target.style.boxShadow = "none"; }}
          />
        </div>

        <div style={card}>
          <div style={hdr}><span style={dot("#6ee7b7")} /><span style={lbl}>Upload Resumes</span></div>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
            onClick={() => fileRef.current.click()}
            style={{ border: `1.5px dashed ${dragOver ? "rgba(167,139,250,0.6)" : "rgba(255,255,255,0.08)"}`, borderRadius: 10, padding: "16px", textAlign: "center", cursor: "pointer", background: dragOver ? "rgba(139,92,246,0.06)" : "transparent", transition: "all 0.2s", marginTop: 10 }}
          >
            <input ref={fileRef} type="file" accept=".pdf,.txt" multiple style={{ display: "none" }} onChange={e => addFiles(e.target.files)} />
            <div style={{ color: "#4a5580", fontSize: 13 }}>Drop files or <span style={{ color: "#a78bfa" }}>browse</span></div>
            <div style={{ color: "#2a3050", fontSize: 11, marginTop: 3 }}>Select multiple PDF · TXT</div>
          </div>

          {files.length > 0 && (
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              {files.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "7px 10px" }}>
                  <span style={{ fontSize: 14 }}>📄</span>
                  <span style={{ flex: 1, fontSize: 12, color: "#8a8ab8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                  <button onClick={() => removeFile(i)} style={{ background: "none", border: "none", color: "#3a4060", cursor: "pointer", fontSize: 12, padding: "2px 4px" }}>✕</button>
                </div>
              ))}
              <div style={{ fontSize: 11, color: "#3a4060" }}>{files.length} file{files.length > 1 ? "s" : ""} ready</div>
            </div>
          )}
        </div>
      </div>

      {error && <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 14px", color: "#f87171", fontSize: 13, marginBottom: 16 }}>⚠️ {error}</div>}

          {loading && progress.total > 0 && (
            <div style={{ background: "#16172a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "16px 20px", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "#8a8ab8" }}>Analyzing {progress.current} of {progress.total}</span>
                <span style={{ fontSize: 12, color: "#a78bfa" }}>{Math.round((progress.current / progress.total) * 100)}%</span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
                <div style={{ height: "100%", width: `${(progress.current / progress.total) * 100}%`, background: "linear-gradient(90deg,#7c3aed,#4f46e5)", borderRadius: 4, transition: "width 0.4s ease" }} />
              </div>
              <div style={{ fontSize: 11, color: "#5b6a9a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📄 {progress.name}</div>
            </div>
          )}

      <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
        <button className="btn-primary" onClick={async () => { await analyzeAll(); }} disabled={loading}
          style={{ flex: 1, padding: "13px", borderRadius: 12, border: "none", background: loading ? "rgba(99,102,241,0.1)" : "linear-gradient(135deg,#7c3aed,#4f46e5)", color: loading ? "#3a4060" : "#fff", fontSize: 14, fontWeight: 600, letterSpacing: 0.5, fontFamily: "inherit", boxShadow: loading ? "none" : "0 4px 20px rgba(99,102,241,0.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s" }}>
          {loading ? <>{`Analyzing ${progress.current}/${progress.total}: ${progress.name?.replace(/\.[^.]+$/, "") || ""}...`}</> : `⚡  Compare ${files.length > 0 ? files.length + " " : ""}Resumes`}
        </button>
        {results.length > 0 && <button onClick={reset} style={{ padding: "13px 20px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)", background: "transparent", color: "#4a5580", fontSize: 13, fontFamily: "inherit", cursor: "pointer" }}>↺ Reset</button>}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div style={{ animation: "fadeIn 0.4s ease forwards" }}>

          {/* Best match */}
          <div style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.15),rgba(124,58,237,0.08))", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 16, padding: "22px", marginBottom: 20, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div style={{ fontSize: 36 }}>🏆</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: "#a78bfa", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Best Match</div>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-display)", color: "#f0eeff", marginBottom: 4 }}>{best.name.replace(/\.[^.]+$/, "")}</div>
              <div style={{ fontSize: 13, color: "#5b6a9a" }}>{best.summary}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 38, fontWeight: 800, fontFamily: "var(--font-display)", color: scoreColor(best.score), lineHeight: 1 }}>{best.score}</div>
              <div style={{ fontSize: 12, color: "#3a4060" }}>/10</div>
              <div style={{ ...pill(getVerdict(best.score)), marginTop: 8 }}>{best.verdict}</div>
            </div>
          </div>

          {/* Rankings table */}
          <div style={{ ...card, marginBottom: 20 }}>
            <div style={hdr}><span style={dot("#fbbf24")} /><span style={lbl}>All Candidates Ranked</span></div>
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
              {results.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, background: i === 0 ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${i === 0 ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)"}`, borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: i < 3 ? 20 : 12, width: 28, textAlign: "center", color: i < 3 ? "#fbbf24" : "#3a4060", fontWeight: 700 }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#c4c4e0", marginBottom: 2 }}>{r.name.replace(/\.[^.]+$/, "")}</div>
                    <div style={{ fontSize: 11, color: "#3a4060" }}>{r.recommendation?.slice(0, 70)}...</div>
                  </div>
                  <div style={{ width: 110, flexShrink: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 10, color: "#3a4060" }}>Score</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: scoreColor(r.score) }}>{r.score}/10</span>
                    </div>
                    <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${r.score * 10}%`, background: barGrad(r.score), borderRadius: 3, transition: "width 1s ease" }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail cards */}
          <div style={hdr}><span style={dot("#f472b6")} /><span style={{ ...lbl, marginBottom: 14, display: "block" }}>Detailed Breakdown</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14, marginTop: 14 }}>
            {results.map((r, i) => (
              <div key={i} style={{ background: "#16172a", border: `1px solid ${i === 0 ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.06)"}`, borderRadius: 14, padding: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 10, color: "#5b6a9a", marginBottom: 3 }}>{i === 0 ? "🏆 TOP PICK" : `RANK #${i + 1}`}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#c4c4e0" }}>{r.name.replace(/\.[^.]+$/, "")}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "var(--font-display)", color: scoreColor(r.score), lineHeight: 1 }}>{r.score}</div>
                    <div style={{ fontSize: 10, color: "#3a4060" }}>/10</div>
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}><span style={pill(getVerdict(r.score))}>{getVerdict(r.score)}</span></div>
                <div style={{ marginBottom: 12 }}>
                  {Object.entries(r.skillBreakdown).map(([k, v]) => (
                    <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                      <span style={{ fontSize: 10, color: "#3a4060", width: 64, flexShrink: 0 }}>{{ technicalSkills:"Tech", experience:"Exp", education:"Edu", projectRelevance:"Projects" }[k]}</span>
                      <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${v * 10}%`, background: barGrad(v), borderRadius: 3, transition: "width 1s ease" }} />
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: scoreColor(v), width: 18, textAlign: "right" }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 10, color: "#4a5580", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, opacity: 0.7 }}>Top strengths</div>
                {r.strengths.slice(0, 2).map((s, j) => (
                  <div key={j} style={{ fontSize: 12, color: "#5b6a9a", marginBottom: 4, display: "flex", gap: 6 }}>
                    <span style={{ color: "#6ee7b7" }}>▸</span>{s}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const card = { background: "#16172a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "18px 20px" };
const hdr  = { display: "flex", alignItems: "center", gap: 8 };
const lbl  = { fontSize: 11, fontWeight: 600, color: "#5b6a9a", textTransform: "uppercase", letterSpacing: 1.5 };
const dot  = c => ({ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}`, flexShrink: 0 });
const inp  = { width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, color: "#f0eeff", fontSize: 14, padding: "11px 14px", outline: "none", fontFamily: "inherit", transition: "all 0.2s", marginTop: 10 };
