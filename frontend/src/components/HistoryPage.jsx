import { useState } from "react";

export default function HistoryPage({ history, onRemove, onClear, onReview }) {
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState("all");

  const filtered = history.filter((e) => {
    if (filter === "all") return true;
    if (filter === "single") return e.type === "single";
    if (filter === "compare") return e.type === "compare";
    return true;
  });

  const getVerdict = s => s >= 8.5 ? "Highly Recommended" : s >= 6.5 ? "Recommended" : s >= 4.0 ? "Borderline" : "Not Recommended";
  const scoreColor = (s) => s >= 8 ? "#6ee7b7" : s >= 6 ? "#fbbf24" : s >= 4 ? "#fb923c" : "#f87171";
  const barGrad    = (s) => s >= 8 ? "linear-gradient(90deg,#059669,#6ee7b7)" : s >= 6 ? "linear-gradient(90deg,#d97706,#fbbf24)" : s >= 4 ? "linear-gradient(90deg,#ea580c,#fb923c)" : "linear-gradient(90deg,#dc2626,#f87171)";
  const verdictC   = (v) => v === "Highly Recommended" ? ["rgba(110,231,183,0.1)","rgba(110,231,183,0.3)","#6ee7b7"] : v === "Recommended" ? ["rgba(99,102,241,0.1)","rgba(99,102,241,0.3)","#818cf8"] : v === "Borderline" ? ["rgba(251,191,36,0.1)","rgba(251,191,36,0.3)","#fbbf24"] : ["rgba(248,113,113,0.1)","rgba(248,113,113,0.3)","#f87171"];
  const pill = (v) => { const [bg,b,c] = verdictC(v); return { display:"inline-flex", alignItems:"center", gap:4, padding:"3px 11px", borderRadius:100, background:bg, border:`1px solid ${b}`, color:c, fontSize:11, fontWeight:600 }; };

  const fmt = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) + "  " + d.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
  };

  return (
    <div style={{ padding: "24px 28px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={breadcrumb}>Dashboard / History</div>
          <h2 style={pageTitle}>Analysis History</h2>
          <p style={{ fontSize: 13, color: "#5b6a9a", marginTop: 4 }}>{history.length} total record{history.length !== 1 ? "s" : ""}</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* Filter tabs */}
          <div style={filterBar}>
            {["all", "single", "compare"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={{ ...filterBtn, background: filter === f ? "rgba(139,92,246,0.2)" : "transparent", color: filter === f ? "#c4b5fd" : "#4a5580", border: filter === f ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent" }}>
                {f === "all" ? "All" : f === "single" ? "⚡ Analyze" : "⚖️ Compare"}
              </button>
            ))}
          </div>
          {history.length > 0 && (
            <button onClick={onClear} style={dangerBtn}>🗑 Clear All</button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={emptyState}>
          <div style={emptyOrb} />
          <div style={{ fontSize: 14, color: "#3a4060", fontWeight: 600, marginTop: 18 }}>No history yet</div>
          <div style={{ fontSize: 12, color: "#2a3050", marginTop: 6 }}>Run an analysis to see it appear here.</div>
        </div>
      )}

      {/* History list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((entry) => {
          const isExpanded = expandedId === entry.id;
          const isSingle   = entry.type === "single";

          return (
            <div key={entry.id} style={{ ...historyCard, border: isExpanded ? "1px solid rgba(139,92,246,0.25)" : "1px solid rgba(255,255,255,0.06)" }}>

              {/* Card header row */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>

                {/* Type badge */}
                <div style={typeBadge(isSingle)}>
                  {isSingle ? "⚡ Analyze" : "⚖️ Compare"}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#c4c4e0", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {isSingle ? (entry.fileName || "Resume") : `${entry.files?.length || 0} resumes compared`}
                  </div>
                  <div style={{ fontSize: 12, color: "#3a4060" }}>
                    <span style={{ color: "#5b6a9a" }}>Job: </span>{entry.jobPrompt}
                  </div>
                </div>

                {/* Score (single) or best score (compare) */}
                {isSingle ? (
                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "var(--font-display)", color: scoreColor(entry.result?.score), lineHeight: 1 }}>{entry.result?.score}</div>
                    <div style={{ fontSize: 10, color: "#3a4060" }}>/10</div>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: "#5b6a9a", marginBottom: 2 }}>Best</div>
                    <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display)", color: scoreColor(entry.results?.[0]?.score), lineHeight: 1 }}>{entry.results?.[0]?.score}</div>
                    <div style={{ fontSize: 10, color: "#3a4060" }}>/10</div>
                  </div>
                )}

                {/* Verdict */}
                {isSingle && getVerdict(entry.result?.score) && (
                  <div style={{ flexShrink: 0 }}><span style={pill(entry.result.verdict)}>{entry.result.verdict}</span></div>
                )}

                {/* Timestamp */}
                <div style={{ fontSize: 11, color: "#3a4060", flexShrink: 0, textAlign: "right" }}>{fmt(entry.timestamp)}</div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => setExpandedId(isExpanded ? null : entry.id)} style={iconBtn}>
                    {isExpanded ? "▲" : "▼"}
                  </button>
                  <button onClick={() => onReview(entry)} style={{ ...iconBtn, color: "#a78bfa", borderColor: "rgba(139,92,246,0.3)" }} title="Load in analyzer">↗</button>
                  <button onClick={() => onRemove(entry.id)} style={{ ...iconBtn, color: "#f87171", borderColor: "rgba(248,113,113,0.2)" }} title="Delete">✕</button>
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.05)", animation: "fadeIn 0.2s ease" }}>
                  {isSingle && entry.result && (
                    <div>
                      {/* Skill bars */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px", marginBottom: 16 }}>
                        {Object.entries(entry.result.skillBreakdown || {}).map(([k, v]) => (
                          <div key={k}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                              <span style={{ fontSize: 11, color: "#5b6a9a" }}>{{ technicalSkills:"Technical", experience:"Experience", education:"Education", projectRelevance:"Projects" }[k]}</span>
                              <span style={{ fontSize: 11, fontWeight: 700, color: scoreColor(v) }}>{v}/10</span>
                            </div>
                            <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${v * 10}%`, background: barGrad(v), borderRadius: 3 }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Summary */}
                      <div style={{ fontSize: 13, color: "#5b6a9a", lineHeight: 1.65, background: "rgba(255,255,255,0.02)", borderRadius: 8, padding: "10px 14px" }}>
                        {entry.result.summary}
                      </div>
                      {/* Strengths & gaps */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 14 }}>
                        <div>
                          <div style={{ fontSize: 10, color: "#6ee7b760", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Strengths</div>
                          {(entry.result.strengths || []).map((s, i) => <div key={i} style={{ fontSize: 12, color: "#5b6a9a", marginBottom: 5, display: "flex", gap: 6 }}><span style={{ color: "#6ee7b7" }}>▸</span>{s}</div>)}
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: "#f8717160", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Gaps</div>
                          {(entry.result.gaps || []).map((g, i) => <div key={i} style={{ fontSize: 12, color: "#5b6a9a", marginBottom: 5, display: "flex", gap: 6 }}><span style={{ color: "#f87171" }}>▸</span>{g}</div>)}
                        </div>
                      </div>
                    </div>
                  )}

                  {!isSingle && entry.results && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {entry.results.map((r, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.02)", borderRadius: 8, padding: "10px 14px" }}>
                          <span style={{ fontSize: i < 3 ? 16 : 12, width: 24 }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`}</span>
                          <span style={{ flex: 1, fontSize: 13, color: "#8a8ab8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name?.replace(/\.[^.]+$/, "")}</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: scoreColor(r.score) }}>{r.score}/10</span>
                          <span style={pill(getVerdict(r.score))}>{r.verdict}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Styles ── */
const breadcrumb  = { fontSize: 11, color: "#5b6a9a", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 };
const pageTitle   = { fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "#f0eeff" };
const filterBar   = { display: "flex", gap: 4, background: "#12121f", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: 4 };
const filterBtn   = { padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 500, fontFamily: "inherit", transition: "all 0.15s" };
const dangerBtn   = { padding: "7px 14px", borderRadius: 10, border: "1px solid rgba(248,113,113,0.2)", background: "rgba(248,113,113,0.06)", color: "#f87171", fontSize: 12, fontFamily: "inherit", cursor: "pointer" };
const emptyState  = { background: "#16172a", border: "2px dashed rgba(255,255,255,0.05)", borderRadius: 16, minHeight: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" };
const emptyOrb    = { width: 60, height: 60, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)", border: "1px solid rgba(99,102,241,0.15)" };
const historyCard = { background: "#16172a", borderRadius: 14, padding: "16px 18px", transition: "border-color 0.2s" };
const iconBtn     = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, color: "#5b6a9a", cursor: "pointer", fontSize: 12, padding: "5px 9px", fontFamily: "inherit", transition: "all 0.15s" };
const typeBadge   = (s) => ({ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 100, background: s ? "rgba(99,102,241,0.1)" : "rgba(244,114,182,0.1)", border: `1px solid ${s ? "rgba(99,102,241,0.25)" : "rgba(244,114,182,0.25)"}`, color: s ? "#818cf8" : "#f472b6", fontSize: 11, fontWeight: 600, flexShrink: 0 });
