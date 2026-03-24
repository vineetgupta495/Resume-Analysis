// Override AI verdict based on score — fixes small model inconsistencies
function getVerdict(score) {
  if (score >= 8.5) return "Highly Recommended";
  if (score >= 6.5) return "Recommended";
  if (score >= 4.0) return "Borderline";
  return "Not Recommended";
}

export default function ScoreCard({ result }) {
  const { score, summary, strengths, gaps, skillBreakdown, recommendation } = result;
  const verdict = getVerdict(score); // always derived from score

  return (
    <div style={{ animation: "fadeIn 0.4s ease forwards" }}>

      {/* ── Score + Verdict ── */}
      <div style={{ ...card, background: "linear-gradient(145deg,#16172a,#1a1b35)", marginBottom: 14 }}>
        <div style={cardHeader}>
          <span style={dot("#a78bfa")} /><span style={cardLabel}>Summary Card</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 16, flexWrap: "wrap" }}>

          {/* Gauge */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <svg width="120" height="70" viewBox="0 0 140 80">
              <path d="M 12 75 A 58 58 0 0 1 128 75" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" strokeLinecap="round"/>
              <path d="M 12 75 A 58 58 0 0 1 128 75" fill="none" stroke="url(#gg)" strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(score / 10) * 182} 182`}
                style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)", filter: `drop-shadow(0 0 6px ${scoreColor(score)}80)` }}
              />
              <defs>
                <linearGradient id="gg" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1"/>
                  <stop offset="100%" stopColor={scoreColor(score)}/>
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, textAlign: "center" }}>
              <span style={{ fontSize: 30, fontWeight: 800, fontFamily: "var(--font-display)", color: scoreColor(score) }}>{score}</span>
              <span style={{ fontSize: 13, color: "#3a4060" }}>/10</span>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ marginBottom: 10 }}>
              <span style={verdictPill(verdict)}>{verdictIcon(verdict)} {verdict}</span>
            </div>
            <p style={{ fontSize: 13, color: "#7080b0", lineHeight: 1.65 }}>{summary}</p>
          </div>
        </div>
      </div>

      {/* ── Skill Breakdown ── */}
      <div style={{ ...card, marginBottom: 14 }}>
        <div style={cardHeader}>
          <span style={dot("#6ee7b7")} /><span style={cardLabel}>Skill Breakdown</span>
        </div>
        <div style={{ marginTop: 14 }}>
          {Object.entries(skillBreakdown).map(([key, val]) => (
            <div key={key} style={{ marginBottom: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "#8a8ab8" }}>{SKILL_LABELS[key]}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: scoreColor(val) }}>{val}/10</span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 6, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${val * 10}%`, borderRadius: 6, background: barGrad(val), transition: "width 1s cubic-bezier(0.4,0,0.2,1)", boxShadow: `0 0 8px ${scoreColor(val)}50` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Strengths & Gaps ── */}
      <div style={{ ...card, marginBottom: 14 }}>
        <div style={cardHeader}>
          <span style={dot("#f472b6")} /><span style={cardLabel}>Strengths & Gaps</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 14 }}>
          <div>
            <div style={subLabel("#6ee7b7")}>Strengths</div>
            {strengths.map((s, i) => (
              <div key={i} style={listRow}>
                <span style={{ color: "#6ee7b7", fontSize: 16, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 13, color: "#8a8ab8", lineHeight: 1.5 }}>{s}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={subLabel("#f87171")}>Gaps</div>
            {gaps.map((g, i) => (
              <div key={i} style={listRow}>
                <span style={{ color: "#f87171", fontSize: 16, flexShrink: 0 }}>✕</span>
                <span style={{ fontSize: 13, color: "#8a8ab8", lineHeight: 1.5 }}>{g}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Note ── */}
      <div style={{ ...card, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)", display: "flex", gap: 12 }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
        <p style={{ fontSize: 13, color: "#7080b0", lineHeight: 1.65, margin: 0 }}>
          <strong style={{ color: "#a78bfa" }}>Note: </strong>{recommendation}
        </p>
      </div>
    </div>
  );
}

const SKILL_LABELS = { technicalSkills: "Technical Skills", experience: "Experience", education: "Education", projectRelevance: "Project Relevance" };
const scoreColor = s => s >= 8 ? "#6ee7b7" : s >= 6 ? "#fbbf24" : s >= 4 ? "#fb923c" : "#f87171";
const barGrad = s => s >= 8 ? "linear-gradient(90deg,#059669,#6ee7b7)" : s >= 6 ? "linear-gradient(90deg,#d97706,#fbbf24)" : s >= 4 ? "linear-gradient(90deg,#ea580c,#fb923c)" : "linear-gradient(90deg,#dc2626,#f87171)";
const verdictIcon = v => v === "Highly Recommended" ? "★" : v === "Recommended" ? "✓" : v === "Borderline" ? "~" : "✕";
const verdictC = v => v === "Highly Recommended" ? ["rgba(110,231,183,0.1)","rgba(110,231,183,0.25)","#6ee7b7"] : v === "Recommended" ? ["rgba(99,102,241,0.1)","rgba(99,102,241,0.25)","#818cf8"] : v === "Borderline" ? ["rgba(251,191,36,0.1)","rgba(251,191,36,0.25)","#fbbf24"] : ["rgba(248,113,113,0.1)","rgba(248,113,113,0.25)","#f87171"];
const verdictPill = v => { const [bg,border,color] = verdictC(v); return { display:"inline-flex", alignItems:"center", gap:6, padding:"4px 14px", borderRadius:100, background:bg, border:`1px solid ${border}`, color, fontSize:12, fontWeight:600, letterSpacing:0.3 }; };
const dot = c => ({ display:"inline-block", width:7, height:7, borderRadius:"50%", background:c, boxShadow:`0 0 6px ${c}`, flexShrink:0 });
const subLabel = c => ({ fontSize:10, fontWeight:700, color:c, textTransform:"uppercase", letterSpacing:1.5, marginBottom:10, opacity:0.7 });
const listRow = { display:"flex", gap:8, marginBottom:10, alignItems:"flex-start" };
const card = { background:"#16172a", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:"18px 20px" };
const cardHeader = { display:"flex", alignItems:"center", gap:8 };
const cardLabel = { fontSize:11, fontWeight:600, color:"#5b6a9a", textTransform:"uppercase", letterSpacing:1.5 };
