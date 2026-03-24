import { useState, useEffect, useRef } from "react";
import { useResumeAnalyzer } from "./hooks/useResumeAnalyzer";
import { useHistory } from "./hooks/useHistory";
import UploadZone from "./components/UploadZone";
import ScoreCard from "./components/ScoreCard";
import CompareResumes from "./components/CompareResumes";
import HistoryPage from "./components/HistoryPage";

const NAV_ITEMS = [
  { id: "analyze",  icon: "⚡", label: "Analyze Resume"  },
  { id: "compare",  icon: "⚖️", label: "Compare Resumes" },
  { id: "history",  icon: "🕒", label: "History"         },
  { id: "settings", icon: "⚙️", label: "Settings"        },
];

export default function App() {
  const [activePage, setActivePage]   = useState("analyze");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [reviewResult, setReviewResult] = useState(null);

  const { jobPrompt, setJobPrompt, file, handleFile, result, loading, error, analyze, reset } = useResumeAnalyzer();
  const { history, addEntry, removeEntry, clearAll } = useHistory();

  // Save to history exactly once when a new result arrives
  const savedResultId = useRef(null);
  useEffect(() => {
    if (!result) return;
    const id = JSON.stringify(result).slice(0, 40); // fingerprint
    if (savedResultId.current === id) return;
    savedResultId.current = id;
    addEntry({
      type: "single",
      jobPrompt,
      fileName: file?.name || "Resume",
      result,
    });
  }, [result]); // eslint-disable-line

  const handleReset = () => {
    reset();
    setReviewResult(null);
    savedResultId.current = null;
  };

  const handleReview = (entry) => {
    setReviewResult(entry.type === "single" ? entry.result : null);
    setActivePage("analyze");
  };

  const displayResult = result || reviewResult;
  const historyCount  = history.length;

  return (
    <div style={layoutStyle}>
      <style>{globalCSS}</style>

      {/* ── Sidebar ── */}
      <aside style={{ ...sidebarStyle, width: sidebarOpen ? 230 : 66 }}>
        <div style={logoAreaStyle}>
          <div style={logoIconStyle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="url(#lg1)"/>
              <path d="M8 12l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs><linearGradient id="lg1" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop stopColor="#a78bfa"/><stop offset="1" stopColor="#6366f1"/></linearGradient></defs>
            </svg>
          </div>
          {sidebarOpen && (
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#f0eeff", fontFamily: "var(--font-display)", whiteSpace: "nowrap" }}>ResumeAI</div>
              <div style={{ fontSize: 9, color: "#5b6a9a", letterSpacing: 2, textTransform: "uppercase" }}>Analysis Bot</div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={toggleBtnStyle}>{sidebarOpen ? "‹" : "›"}</button>
        </div>

        <div style={dividerStyle} />

        <nav style={{ padding: "8px", flex: 1 }}>
          {sidebarOpen && <div style={navGroupLabel}>Main Menu</div>}
          {NAV_ITEMS.map((item) => {
            const active = activePage === item.id;
            return (
              <button key={item.id} onClick={() => setActivePage(item.id)}
                title={!sidebarOpen ? item.label : ""}
                style={{ ...navItemBase, background: active ? "linear-gradient(135deg,rgba(139,92,246,0.25),rgba(99,102,241,0.15))" : "transparent", boxShadow: active ? "inset 0 0 0 1px rgba(139,92,246,0.3)" : "none", color: active ? "#c4b5fd" : "#5b6a9a", justifyContent: sidebarOpen ? "flex-start" : "center" }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                {sidebarOpen && <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, flex: 1, textAlign: "left" }}>{item.label}</span>}
                {item.id === "history" && historyCount > 0 && sidebarOpen && (
                  <span style={navBadge}>{historyCount > 99 ? "99+" : historyCount}</span>
                )}
                {active && sidebarOpen && <span style={activeIndicator} />}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: sidebarOpen ? "14px 16px" : "14px 8px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: sidebarOpen ? "flex-start" : "center" }}>
            <div style={avatarStyle}>HR</div>
            {sidebarOpen && <div><div style={{ fontSize: 13, fontWeight: 600, color: "#c4c4e0" }}>HR Manager</div><div style={{ fontSize: 11, color: "#4a5580" }}>Admin</div></div>}
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={mainStyle}>

        {/* Topbar */}
        <div style={topbarStyle}>
          <div>
            <div style={breadcrumb}>Dashboard / {activePage.charAt(0).toUpperCase() + activePage.slice(1)}</div>
            <h1 style={topTitleStyle}>
              {activePage === "analyze" ? "Resume Analysis" : activePage === "compare" ? "Compare Resumes" : activePage === "history" ? "History" : "Settings"}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={infoPillStyle}>
              <span style={{ color: "#a78bfa", fontSize: 13 }}>●</span>
              {activePage === "compare" ? "Multi-resume comparison" : activePage === "history" ? `${historyCount} saved records` : "AI-powered scoring active"}
            </div>
            <div style={topAvatarStyle}>HR</div>
          </div>
        </div>

        {/* ── Analyze Page ── */}
        {activePage === "analyze" && (
          <div style={contentPad}>
            <div style={welcomeBanner}>
              <div>
                <div style={{ fontSize: 11, color: "#a78bfa", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Welcome back 👋</div>
                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-display)", color: "#f0eeff", marginBottom: 4 }}>Resume Analysis Bot</div>
                <div style={{ fontSize: 13, color: "#7080b0" }}>Upload a resume & job requirement to get an AI-powered match score.</div>
              </div>
              <div style={bannerOrb} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "370px 1fr", gap: 20, alignItems: "start" }}>

              {/* Left */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={glassCard}>
                  <div style={cardHdr}><span style={dot("#a78bfa")} /><span style={cardLbl}>Job Requirement</span></div>
                  <input value={jobPrompt} onChange={(e) => setJobPrompt(e.target.value)}
                    placeholder="e.g., Python, React, Node.js..."
                    style={elegantInput}
                    onFocus={(e) => { e.target.style.borderColor = "rgba(167,139,250,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.1)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.06)"; e.target.style.boxShadow = "none"; }}
                  />
                </div>

                <div style={glassCard}>
                  <div style={cardHdr}><span style={dot("#6ee7b7")} /><span style={cardLbl}>Resume File</span></div>
                  <UploadZone file={file} onFile={handleFile} />
                </div>

                {error && <div style={errorBox}>⚠️ {error}</div>}

                <button className="btn-primary" onClick={analyze} disabled={loading} style={analyzeBtn(loading)}>
                  {loading
                    ? <><svg className="spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>Analyzing...</>
                    : "⚡  Analyze Resume"
                  }
                </button>

                {displayResult && (
                  <button onClick={handleReset} style={ghostBtn}>↺  Start New Analysis</button>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {[
                    { label: "Analyzed",  value: history.filter(h => h.type === "single").length,  color: "#a78bfa" },
                    { label: "Compared",  value: history.filter(h => h.type === "compare").length, color: "#6ee7b7" },
                    { label: "Records",   value: historyCount,                                      color: "#f472b6" },
                  ].map(s => (
                    <div key={s.label} style={miniStat}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: "var(--font-display)" }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: "#4a5580", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right */}
              <div>
                {displayResult
                  ? <ScoreCard result={displayResult} />
                  : (
                    <div style={emptyPanel}>
                      <div style={emptyOrb} />
                      <div style={{ fontSize: 13, color: "#3a4060", fontWeight: 500, marginTop: 16 }}>No analysis yet</div>
                      <div style={{ fontSize: 12, color: "#2a3050", marginTop: 6 }}>Results will appear here</div>
                    </div>
                  )
                }
              </div>
            </div>
          </div>
        )}

        {activePage === "compare"  && <CompareResumes onSaveHistory={addEntry} />}
        {activePage === "history"  && <HistoryPage history={history} onRemove={removeEntry} onClear={clearAll} onReview={handleReview} />}
        {activePage === "settings" && (
          <div style={placeholderStyle}>
            <div style={emptyOrb} />
            <div style={{ fontSize: 14, color: "#3a4060", fontWeight: 600, marginTop: 20 }}>Settings coming soon</div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ── Styles ── */
const C = { bg:"#0e0e1a", sidebar:"#12121f", card:"#16172a", border:"rgba(255,255,255,0.06)", text:"#f0eeff", muted:"#5b6a9a", divider:"rgba(255,255,255,0.05)" };
const layoutStyle    = { display:"flex", minHeight:"100vh", background:C.bg, fontFamily:"var(--font-body)", color:C.text };
const sidebarStyle   = { background:C.sidebar, borderRight:`1px solid ${C.divider}`, display:"flex", flexDirection:"column", transition:"width 0.25s cubic-bezier(0.4,0,0.2,1)", overflow:"hidden", flexShrink:0, position:"sticky", top:0, height:"100vh" };
const logoAreaStyle  = { display:"flex", alignItems:"center", gap:10, padding:"20px 14px 14px" };
const logoIconStyle  = { width:34, height:34, borderRadius:10, background:"linear-gradient(135deg,#7c3aed,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 4px 12px rgba(124,58,237,0.4)" };
const toggleBtnStyle = { marginLeft:"auto", background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:16, padding:"4px 6px", flexShrink:0 };
const dividerStyle   = { height:1, background:C.divider, margin:"4px 14px" };
const navGroupLabel  = { fontSize:9, color:"#3a4060", letterSpacing:2, textTransform:"uppercase", padding:"4px 8px 10px", fontWeight:600 };
const navItemBase    = { width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, border:"none", cursor:"pointer", marginBottom:3, transition:"all 0.15s ease", fontFamily:"inherit", position:"relative" };
const activeIndicator= { position:"absolute", right:10, width:6, height:6, borderRadius:"50%", background:"#a78bfa", boxShadow:"0 0 8px #a78bfa" };
const navBadge       = { background:"rgba(167,139,250,0.2)", border:"1px solid rgba(167,139,250,0.3)", color:"#c4b5fd", borderRadius:100, fontSize:9, fontWeight:700, padding:"1px 6px", marginRight:4 };
const avatarStyle    = { width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0 };
const mainStyle      = { flex:1, display:"flex", flexDirection:"column", overflow:"auto", background:C.bg, backgroundImage:"radial-gradient(ellipse at 20% 0%,rgba(99,102,241,0.07) 0%,transparent 50%),radial-gradient(ellipse at 80% 100%,rgba(124,58,237,0.05) 0%,transparent 50%)" };
const topbarStyle    = { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 28px", borderBottom:`1px solid ${C.divider}`, background:C.sidebar, flexWrap:"wrap", gap:10 };
const breadcrumb     = { fontSize:11, color:C.muted, letterSpacing:2, textTransform:"uppercase", marginBottom:3 };
const topTitleStyle  = { margin:0, fontSize:22, fontWeight:700, fontFamily:"var(--font-display)", color:C.text, letterSpacing:-0.3 };
const infoPillStyle  = { background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:100, padding:"6px 14px", fontSize:12, color:"#8b8bcc", display:"flex", alignItems:"center", gap:7 };
const topAvatarStyle = { ...avatarStyle, width:36, height:36, fontSize:12 };
const contentPad     = { padding:"24px 28px" };
const welcomeBanner  = { background:"linear-gradient(135deg,rgba(99,102,241,0.15),rgba(124,58,237,0.08))", border:"1px solid rgba(139,92,246,0.2)", borderRadius:16, padding:"22px 28px", marginBottom:22, display:"flex", justifyContent:"space-between", alignItems:"center", overflow:"hidden" };
const bannerOrb      = { width:70, height:70, borderRadius:"50%", background:"radial-gradient(circle,rgba(167,139,250,0.3) 0%,transparent 70%)", flexShrink:0 };
const glassCard      = { background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"18px 20px" };
const cardHdr        = { display:"flex", alignItems:"center", gap:8, marginBottom:14 };
const cardLbl        = { fontSize:11, fontWeight:600, color:"#8a8ab8", textTransform:"uppercase", letterSpacing:1.5 };
const dot            = (c) => ({ display:"inline-block", width:7, height:7, borderRadius:"50%", background:c, boxShadow:`0 0 6px ${c}`, flexShrink:0 });
const elegantInput   = { width:"100%", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:10, color:C.text, fontSize:14, padding:"11px 14px", outline:"none", fontFamily:"inherit", transition:"all 0.2s" };
const errorBox       = { background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:10, padding:"10px 14px", color:"#f87171", fontSize:13 };
const analyzeBtn     = (l) => ({ width:"100%", padding:"13px", borderRadius:12, border:"none", background:l?"rgba(99,102,241,0.1)":"linear-gradient(135deg,#7c3aed,#4f46e5)", color:l?"#3a4060":"#fff", fontSize:14, fontWeight:600, letterSpacing:0.5, fontFamily:"inherit", boxShadow:l?"none":"0 4px 20px rgba(99,102,241,0.4)", display:"flex", alignItems:"center", justifyContent:"center", gap:8, cursor:l?"not-allowed":"pointer", transition:"all 0.2s" });
const ghostBtn       = { width:"100%", padding:"11px", borderRadius:12, border:"1px solid rgba(255,255,255,0.07)", background:"transparent", color:"#4a5580", fontSize:13, fontFamily:"inherit", cursor:"pointer" };
const miniStat       = { background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 12px", textAlign:"center" };
const emptyPanel     = { background:C.card, border:`2px dashed rgba(255,255,255,0.05)`, borderRadius:16, minHeight:400, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" };
const emptyOrb       = { width:60, height:60, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.2) 0%,transparent 70%)", border:"1px solid rgba(99,102,241,0.15)" };
const placeholderStyle={ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 24px" };

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
  :root { --font-body:'Plus Jakarta Sans',sans-serif; --font-display:'Space Grotesk',sans-serif; }
  * { box-sizing:border-box; margin:0; padding:0; }
  body { background:#0e0e1a; font-family:var(--font-body); }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:#0e0e1a; }
  ::-webkit-scrollbar-thumb { background:rgba(139,92,246,0.3); border-radius:4px; }
  .btn-primary { transition:all 0.2s ease !important; }
  .btn-primary:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 28px rgba(99,102,241,0.5) !important; }
  .spin { animation:spin 1s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
`;
