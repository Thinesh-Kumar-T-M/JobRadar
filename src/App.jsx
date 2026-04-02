import { useState,useEffect} from "react";

const C = {
  bg:     "#090b11",
  surf:   "#101318",
  surf2:  "#181c26",
  border: "#1e2535",
  accent: "#00d4ff",
  orange: "#f97316",
  text:   "#dde3f0",
  muted:  "#4f607a",
  green:  "#22c55e",
  red:    "#ef4444",
  indigo: "#818cf8",
};

const PLT_COLOR = { LinkedIn: "#0a66c2", Naukri: "#f97316", "Career Page": "#7c3aed" };
const ST_CFG = {
  saved:     { label: "Saved",     c: "#818cf8" },
  applied:   { label: "Applied",   c: "#00d4ff" },
  interview: { label: "Interview", c: "#f97316" },
  offer:     { label: "Offer",     c: "#22c55e" },
  rejected:  { label: "Rejected",  c: "#ef4444" },
};

const INIT_COMPANIES = [
  { id:1, name:"KUKA Robotics",        platforms:["LinkedIn","Career Page"],           active:true  },
  { id:2, name:"ABB Robotics",         platforms:["LinkedIn","Naukri"],                active:true  },
  { id:3, name:"Addverb Technologies", platforms:["LinkedIn","Naukri","Career Page"],  active:true  },
  { id:4, name:"Bechtel",              platforms:["LinkedIn","Career Page"],           active:true  },
  { id:5, name:"Siemens India",        platforms:["LinkedIn","Naukri"],                active:false },
  { id:6, name:"GreyOrange",           platforms:["Career Page"],                      active:false },
  { id:7, name:"Bosch Rexroth",        platforms:["LinkedIn","Career Page"],           active:true  },
  { id:8, name:"Universal Robots",     platforms:["LinkedIn","Career Page"],           active:false },
];

const INIT_JOBS = [
  {
    id:1, title:"Senior Robotics Engineer", company:"KUKA Robotics",
    location:"Pune, MH", platform:"LinkedIn", posted:"2h ago", salary:"₹15–20 LPA",
    jd:"Lead development of KUKA robot cells for automotive and heavy industry. 5+ years in industrial robotics, KUKA KRL programming, offline simulation with RoboDK/KUKA.Sim, ROS2, robot path planning and collision avoidance, PLC integration (Siemens S7/Allen Bradley), ISO 10218 safety standards, and on-site commissioning.",
    tags:["KUKA KRL","ROS2","PLC","RoboDK","ISO 10218","Commissioning"],
    status:null, score:null, scoreData:null, isNew:true,
  },
  {
    id:2, title:"Automation Engineer – AMR", company:"Addverb Technologies",
    location:"Noida, UP", platform:"Naukri", posted:"5h ago", salary:"₹10–14 LPA",
    jd:"Design and deploy autonomous mobile robot fleets in warehouse environments. Required: ROS/ROS2, Nav2 stack, TEB and DWA planners, SLAM algorithms, LiDAR and camera integration, fleet management systems. Python and C++ coding skills mandatory. Hands-on AMR hardware integration experience preferred.",
    tags:["ROS2","Nav2","SLAM","AMR","TEB Planner","Python","C++"],
    status:null, score:null, scoreData:null, isNew:true,
  },
  {
    id:3, title:"Robotics Systems Engineer", company:"ABB Robotics",
    location:"Bengaluru, KA", platform:"Career Page", posted:"1d ago", salary:"₹18–25 LPA",
    jd:"Design and commission robotic systems for automotive and heavy industry applications. ABB RAPID programming, RobotStudio offline simulation, EPLAN electrical design, panel wiring and FAT/SAT experience. Welding automation and inspection systems knowledge is a strong advantage.",
    tags:["ABB RAPID","RobotStudio","EPLAN","Welding Automation","Commissioning"],
    status:"applied", score:null, scoreData:null, isNew:false,
  },
  {
    id:4, title:"Senior Automation Engineer", company:"Bechtel",
    location:"Chennai, TN", platform:"LinkedIn", posted:"3h ago", salary:"₹12–16 LPA",
    jd:"Lead automation and electrical design for large-scale industrial EPC projects. Siemens TIA Portal PLC programming, SCADA (Ignition/WinCC), instrumentation, P&ID reading and interpretation, panel engineering. Minimum 4 years in EPC projects. Experience with safety systems (SIL) is a plus.",
    tags:["PLC","SCADA","TIA Portal","P&ID","EPC","Instrumentation"],
    status:null, score:null, scoreData:null, isNew:true,
  },
  {
    id:5, title:"Mechatronics / Robotics Engineer", company:"Bosch Rexroth",
    location:"Coimbatore, TN", platform:"Career Page", posted:"6h ago", salary:"₹8–12 LPA",
    jd:"Design and commission special-purpose automation machines and robotic work cells. Knowledge of pneumatics, servo drives, PLC programming, electrical panel design. Hands-on experience with SPM development, machine commissioning, and technical documentation.",
    tags:["SPM","Servo Drives","PLC","Electrical Design","Pneumatics"],
    status:null, score:null, scoreData:null, isNew:false,
  },
  {
    id:6, title:"ROS2 Software Engineer – Robotics", company:"GreyOrange",
    location:"Gurugram, HR", platform:"LinkedIn", posted:"12h ago", salary:"₹20–28 LPA",
    jd:"Build and maintain autonomous navigation stack for Ranger AMR. Deep expertise in ROS2, C++17, Nav2, behavior trees, real-time systems, costmap plugins. Experience with multi-robot coordination, fleet orchestration, and warehouse automation preferred.",
    tags:["ROS2","C++17","Nav2","Behavior Trees","Fleet Management"],
    status:null, score:null, scoreData:null, isNew:false,
  },
];

async function fetchScore(resumeText, jd) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `You are a senior technical recruiter specializing in robotics and automation engineering.\n\nRESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jd}\n\nAnalyze the match and return ONLY a raw JSON object. No markdown, no explanation, no backticks.\n\n{\n  "score": <integer 0-100>,\n  "verdict": "<Strong Match|Good Match|Partial Match|Weak Match>",\n  "matching": ["up to 5 specific matching skills"],\n  "missing": ["up to 5 key gaps"],\n  "tip": "<one actionable sentence>"\n}`
      }]
    })
  });
  const data = await res.json();
  const text = data.content.map(b => b.text || "").join("").replace(/```json|```/g,"").trim();
  return JSON.parse(text);
}

const Tag = ({ label, color = C.muted }) => (
  <span style={{
    fontSize: 9, letterSpacing: 0.5, padding: "2px 7px",
    border: `1px solid ${color}55`, color, borderRadius: 2,
    background: color + "14", display: "inline-block",
  }}>{label}</span>
);

const PlatformBadge = ({ platform }) => <Tag label={platform} color={PLT_COLOR[platform] || C.muted} />;
const StatusBadge = ({ status }) => status ? <Tag label={ST_CFG[status].label} color={ST_CFG[status].c} /> : null;

const ScoreMeter = ({ score, verdict }) => {
  if (score === null) return null;
  const color = score >= 75 ? C.green : score >= 50 ? C.orange : C.red;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, height: 3, background: C.border, borderRadius: 2, overflow: "hidden" }}>
          <div style={{ width: `${score}%`, height: "100%", background: color, transition: "width 0.6s ease" }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color, minWidth: 42, fontFamily: "'Barlow Condensed', sans-serif" }}>{score}%</span>
      </div>
      {verdict && <div style={{ fontSize: 9, color, marginTop: 3, letterSpacing: 0.5 }}>{verdict.toUpperCase()}</div>}
    </div>
  );
};

const JobCard = ({ job, expanded, onExpand, onScore, isScoring, onSetStatus }) => {
  const leftColor = job.status ? ST_CFG[job.status].c : job.isNew ? C.orange : C.border;
  return (
    <div style={{
      border: `1px solid ${job.isNew && !job.status ? C.orange + "55" : C.border}`,
      borderLeft: `3px solid ${leftColor}`,
      background: C.surf, borderRadius: 4, marginBottom: 7,
      boxShadow: expanded ? `0 0 0 1px ${C.accent}22` : "none",
    }}>
      <div onClick={onExpand} style={{ padding: "12px 14px", cursor: "pointer", userSelect: "none" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 5 }}>
              {job.isNew && <Tag label="NEW" color={C.orange} />}
              <PlatformBadge platform={job.platform} />
              {job.status && <StatusBadge status={job.status} />}
            </div>
            <div style={{ fontSize: "clamp(13px, 2vw, 16px)", fontWeight: 700, color: C.text, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.3, lineHeight: 1.2 }}>
              {job.title}
            </div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>
              {job.company} · {job.location} · {job.posted}
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>{job.salary}</div>
            <div style={{ fontSize: 9, color: C.muted, marginTop: 6 }}>{expanded ? "▲" : "▼"}</div>
          </div>
        </div>
        <ScoreMeter score={job.score} verdict={job.scoreData?.verdict} />
      </div>

      {expanded && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "12px 14px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
            {job.tags.map(t => <Tag key={t} label={t} color={C.accent} />)}
          </div>
          <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.9, marginBottom: 12 }}>{job.jd}</div>

          {job.scoreData && (
            <div style={{ background: C.surf2, border: `1px solid ${C.border}`, borderRadius: 3, padding: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 9, color: C.accent, letterSpacing: 1.5, marginBottom: 8, fontWeight: 700 }}>⚡ AI MATCH ANALYSIS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 8, color: C.green, letterSpacing: 1, marginBottom: 5 }}>✓ MATCHING SKILLS</div>
                  {job.scoreData.matching?.map(s => (
                    <div key={s} style={{ fontSize: 10, color: C.text, marginBottom: 3, display: "flex", gap: 4 }}>
                      <span style={{ color: C.green, flexShrink: 0 }}>•</span>{s}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 8, color: C.red, letterSpacing: 1, marginBottom: 5 }}>✗ SKILL GAPS</div>
                  {job.scoreData.missing?.map(s => (
                    <div key={s} style={{ fontSize: 10, color: C.text, marginBottom: 3, display: "flex", gap: 4 }}>
                      <span style={{ color: C.red, flexShrink: 0 }}>•</span>{s}
                    </div>
                  ))}
                </div>
              </div>
              {job.scoreData.tip && (
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, fontSize: 10, color: C.orange, lineHeight: 1.7 }}>
                  💡 {job.scoreData.tip}
                </div>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={() => onScore(job)} disabled={isScoring} style={{
              padding: "6px 12px", fontSize: 9, letterSpacing: 0.5,
              background: C.surf2, color: isScoring ? C.muted : C.accent,
              border: `1px solid ${isScoring ? C.border : C.accent}`, borderRadius: 3,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {isScoring ? "⏳ SCORING..." : job.score !== null ? "↻ RE-SCORE" : "⚡ AI SCORE"}
            </button>
            {!job.status && (
              <button onClick={() => onSetStatus(job.id, "saved")} style={{
                padding: "6px 12px", fontSize: 9, letterSpacing: 0.5,
                background: C.surf2, color: C.indigo, border: `1px solid ${C.indigo}`, borderRadius: 3,
                fontFamily: "'JetBrains Mono', monospace",
              }}>💾 SAVE</button>
            )}
            <a href="#" onClick={e => { e.preventDefault(); onSetStatus(job.id, "applied"); }} style={{
              padding: "6px 14px", fontSize: 9, letterSpacing: 0.5, textDecoration: "none",
              background: job.status === "applied" ? C.accent + "18" : C.accent,
              color: job.status === "applied" ? C.accent : C.bg,
              border: `1px solid ${C.accent}`, borderRadius: 3, fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace", display: "inline-block",
            }}>
              {job.status === "applied" ? "✓ APPLIED" : "APPLY →"}
            </a>
            {job.status && (
              <select value={job.status} onChange={e => onSetStatus(job.id, e.target.value)} style={{
                padding: "6px 8px", fontSize: 9, background: C.surf2, color: ST_CFG[job.status].c,
                border: `1px solid ${ST_CFG[job.status].c}55`, borderRadius: 3,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {Object.entries(ST_CFG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const FeedTab = ({ jobs, companies, fCompany, setFCompany, fPlatform, setFPlatform, fNew, setFNew, expandedJob, setExpandedJob, scoringId, setStatus, handleScore }) => (
  <div>
    <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
      <select value={fCompany} onChange={e => setFCompany(e.target.value)} style={{
        flex: "1 1 180px", padding: "9px 10px", fontSize: 11, background: C.surf, color: C.text,
        border: `1px solid ${C.border}`, borderRadius: 3, fontFamily: "'JetBrains Mono', monospace",
      }}>
        <option value="all">All Companies</option>
        {companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
      </select>
      <select value={fPlatform} onChange={e => setFPlatform(e.target.value)} style={{
        flex: "1 1 140px", padding: "9px 10px", fontSize: 11, background: C.surf, color: C.text,
        border: `1px solid ${C.border}`, borderRadius: 3, fontFamily: "'JetBrains Mono', monospace",
      }}>
        <option value="all">All Platforms</option>
        <option value="LinkedIn">LinkedIn</option>
        <option value="Naukri">Naukri</option>
        <option value="Career Page">Career Page</option>
      </select>
      <button onClick={() => setFNew(!fNew)} style={{
        flex: "0 0 auto", padding: "9px 16px", fontSize: 9, letterSpacing: 0.5,
        background: fNew ? C.orange + "20" : C.surf, color: fNew ? C.orange : C.muted,
        border: `1px solid ${fNew ? C.orange : C.border}`, borderRadius: 3,
        fontFamily: "'JetBrains Mono', monospace",
      }}>🆕 NEW ONLY</button>
    </div>
    <div style={{ fontSize: 9, color: C.muted, letterSpacing: 1.5, marginBottom: 10 }}>
      {jobs.length} POSITIONS {(fNew || fCompany !== "all" || fPlatform !== "all") ? "· FILTERED" : ""}
    </div>
    {jobs.length === 0
      ? <div style={{ textAlign: "center", padding: "60px 0", color: C.muted, fontSize: 11 }}>No jobs match your filters.</div>
      : jobs.map(job => (
          <JobCard key={job.id} job={job}
            expanded={expandedJob === job.id}
            onExpand={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
            onScore={handleScore} isScoring={scoringId === job.id}
            onSetStatus={setStatus}
          />
        ))
    }
  </div>
);

const TrackerTab = ({ kanban, setStatus }) => (
  <div>
    <div style={{ fontSize: 9, color: C.muted, letterSpacing: 1.5, marginBottom: 14 }}>APPLICATION PIPELINE</div>
    <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 14 }}>
      {kanban.map(({ s, jobs }) => {
        const cfg = ST_CFG[s];
        return (
          <div key={s} style={{ minWidth: 200, flex: "0 0 200px" }}>
            <div style={{ padding: "7px 10px", marginBottom: 8, borderBottom: `2px solid ${cfg.c}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 9, letterSpacing: 1, color: cfg.c, fontWeight: 700 }}>{cfg.label.toUpperCase()}</span>
              <span style={{ fontSize: 9, color: cfg.c, background: cfg.c + "22", border: `1px solid ${cfg.c}44`, borderRadius: 10, padding: "0 7px" }}>{jobs.length}</span>
            </div>
            {jobs.length === 0
              ? <div style={{ border: `1px dashed ${C.border}`, borderRadius: 3, padding: "22px 10px", fontSize: 9, color: C.muted, textAlign: "center" }}>Empty</div>
              : jobs.map(job => (
                  <div key={job.id} style={{ background: C.surf, border: `1px solid ${C.border}`, borderLeft: `3px solid ${cfg.c}`, borderRadius: 3, padding: "10px", marginBottom: 7 }}>
                    <div style={{ fontSize: 13, color: C.text, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, lineHeight: 1.2 }}>{job.title}</div>
                    <div style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>{job.company}</div>
                    {job.score !== null && (
                      <div style={{ fontSize: 9, color: job.score >= 75 ? C.green : job.score >= 50 ? C.orange : C.red, marginTop: 5, fontWeight: 600 }}>Match: {job.score}%</div>
                    )}
                    <select value={job.status} onChange={e => setStatus(job.id, e.target.value)} style={{
                      marginTop: 8, width: "100%", padding: "5px 6px", fontSize: 9,
                      background: C.surf2, color: C.text, border: `1px solid ${C.border}`,
                      borderRadius: 2, fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      {Object.entries(ST_CFG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                ))
            }
          </div>
        );
      })}
    </div>
  </div>
);

const CompaniesTab = ({ companies, toggleCompany, newCoName, setNewCoName, selPlatforms, setSelPlatforms, addCompany }) => {
  const togglePlatform = p => setSelPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  return (
    <div>
      <div style={{ background: C.surf, border: `1px solid ${C.border}`, borderRadius: 4, padding: 18, marginBottom: 18 }}>
        <div style={{ fontSize: 9, color: C.accent, letterSpacing: 1.5, marginBottom: 12, fontWeight: 700 }}>+ ADD COMPANY</div>
        <input value={newCoName} onChange={e => setNewCoName(e.target.value)} onKeyDown={e => e.key === "Enter" && addCompany()}
          placeholder="Company name  (press Enter)"
          style={{
            width: "100%", padding: "10px 12px", fontSize: 12, background: C.surf2, color: C.text,
            border: `1px solid ${C.border}`, borderRadius: 3, marginBottom: 12,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        />
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          {["LinkedIn","Naukri","Career Page"].map(p => (
            <button key={p} onClick={() => togglePlatform(p)} style={{
              padding: "6px 14px", fontSize: 9, letterSpacing: 0.5,
              background: selPlatforms.includes(p) ? PLT_COLOR[p] + "25" : C.surf2,
              color: selPlatforms.includes(p) ? PLT_COLOR[p] : C.muted,
              border: `1px solid ${selPlatforms.includes(p) ? PLT_COLOR[p] : C.border}`,
              borderRadius: 3, fontFamily: "'JetBrains Mono', monospace",
            }}>{p}</button>
          ))}
        </div>
        <button onClick={addCompany} style={{
          padding: "9px 20px", fontSize: 9, letterSpacing: 1,
          background: C.accent, color: C.bg, border: "none", borderRadius: 3, fontWeight: 700,
          fontFamily: "'JetBrains Mono', monospace",
        }}>ADD TO WATCHLIST</button>
      </div>
      <div style={{ fontSize: 9, color: C.muted, letterSpacing: 1.5, marginBottom: 12 }}>
        WATCHLIST — {companies.filter(c => c.active).length} / {companies.length} ACTIVE
      </div>
      {companies.map(c => (
        <div key={c.id} style={{
          background: C.surf, border: `1px solid ${c.active ? C.accent + "44" : C.border}`,
          borderLeft: `3px solid ${c.active ? C.accent : C.border}`,
          borderRadius: 4, padding: "12px 16px", marginBottom: 7,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          opacity: c.active ? 1 : 0.45,
        }}>
          <div>
            <div style={{ fontSize: 15, color: C.text, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>{c.name}</div>
            <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
              {c.platforms.map(p => <PlatformBadge key={p} platform={p} />)}
            </div>
          </div>
          <button onClick={() => toggleCompany(c.id)} style={{
            padding: "6px 14px", fontSize: 9, letterSpacing: 0.5, flexShrink: 0,
            background: c.active ? C.red + "18" : C.green + "18",
            color: c.active ? C.red : C.green,
            border: `1px solid ${c.active ? C.red : C.green}`, borderRadius: 3,
            fontFamily: "'JetBrains Mono', monospace",
          }}>{c.active ? "UNWATCH" : "▶ WATCH"}</button>
        </div>
      ))}
    </div>
  );
};

const ResumeTab = ({ resume, setResume, resumeStored, setResumeStored }) => (
  <div>
    <div style={{ fontSize: 9, color: C.muted, letterSpacing: 1.5, marginBottom: 8 }}>YOUR RESUME</div>
    <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.8, marginBottom: 14 }}>
      Paste your resume text below. Claude AI uses it to score job compatibility and identify skill gaps.
    </div>
    <textarea value={resume} onChange={e => { setResume(e.target.value); setResumeStored(false); }}
      placeholder={"Paste your resume here...\n\nInclude:\n• Work experience with technologies used\n• Skills and certifications\n• Projects and achievements"}
      rows={18}
      style={{
        width: "100%", padding: 14, fontSize: 11, lineHeight: 1.9,
        background: C.surf, color: C.text,
        border: `1px solid ${resumeStored ? C.green : C.border}`,
        borderRadius: 4, resize: "vertical", marginBottom: 14,
        fontFamily: "'JetBrains Mono', monospace",
      }}
    />
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <button onClick={() => { if (resume.trim()) setResumeStored(true); }} style={{
        padding: "9px 24px", fontSize: 9, letterSpacing: 1,
        background: resumeStored ? C.green + "20" : C.accent,
        color: resumeStored ? C.green : C.bg,
        border: `1px solid ${resumeStored ? C.green : C.accent}`,
        borderRadius: 3, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
      }}>
        {resumeStored ? "✓ RESUME SAVED" : "SAVE RESUME"}
      </button>
      {resume.trim() && <span style={{ fontSize: 10, color: C.muted }}>{resume.trim().split(/\s+/).length} words</span>}
    </div>
    {resumeStored && (
      <div style={{ marginTop: 14, padding: "12px 16px", background: C.green + "12", border: `1px solid ${C.green}44`, borderRadius: 3 }}>
        <div style={{ fontSize: 11, color: C.green, lineHeight: 1.8 }}>
          ✓ Resume saved. Go to the <strong>Feed</strong> tab, open any job card, and tap <strong>⚡ AI SCORE</strong> to get Claude's analysis.
        </div>
      </div>
    )}
  </div>
);

export default function App() {
  const [tab, setTab]                   = useState("feed");
  const [companies, setCompanies] = useState(() => JSON.parse(localStorage.getItem("jr_companies") || "null") || INIT_COMPANIES);
  const [jobs, setJobs] = useState(() => JSON.parse(localStorage.getItem("jr_jobs") || "null") || INIT_JOBS);
  const [resume, setResume]             = useState("");
  const [resumeStored, setResumeStored] = useState(false);
  const [newCoName, setNewCoName]       = useState("");
  const [selPlatforms, setSelPlatforms] = useState(["LinkedIn","Naukri","Career Page"]);
  const [fCompany, setFCompany]         = useState("all");
  const [fPlatform, setFPlatform]       = useState("all");
  const [fNew, setFNew]                 = useState(false);
  const [expandedJob, setExpandedJob]   = useState(null);
  const [scoringId, setScoringId]       = useState(null);

  const watched        = companies.filter(c => c.active);
  const newCount       = jobs.filter(j => j.isNew).length;
  const appliedCount   = jobs.filter(j => j.status === "applied").length;
  const interviewCount = jobs.filter(j => j.status === "interview").length;

  const setStatus = (id, status) =>
    setJobs(p => p.map(j => j.id === id ? { ...j, status, isNew: false } : j));

  const handleScore = async (job) => {
    if (!resumeStored || !resume.trim()) {
      alert("Please paste and save your resume in the Resume tab first.");
      return;
    }
    setScoringId(job.id);
    try {
      const r = await fetchScore(resume, job.jd);
      setJobs(p => p.map(j => j.id === job.id ? { ...j, score: r.score, scoreData: r } : j));
    } catch(e) {
      console.error(e);
      alert("Scoring failed — check console.");
    }
    setScoringId(null);
  };

  const addCompany = () => {
    if (!newCoName.trim()) return;
    setCompanies(p => [...p, { id: Date.now(), name: newCoName.trim(), platforms: selPlatforms, active: true }]);
    setNewCoName("");
  };

  const toggleCompany = id =>
    setCompanies(p => p.map(c => c.id === id ? { ...c, active: !c.active } : c));

  const feedJobs = jobs.filter(j => {
    if (fCompany !== "all" && j.company !== fCompany) return false;
    if (fPlatform !== "all" && j.platform !== fPlatform) return false;
    if (fNew && !j.isNew) return false;
    return true;
  });

  const kanban = ["saved","applied","interview","offer","rejected"].map(s => ({
    s, jobs: jobs.filter(j => j.status === s)
  }));

  const TABS = [["feed","📡","FEED"],["tracker","📋","TRACKER"],["companies","🏭","COMPANIES"],["resume","📄","RESUME"]];
  
  useEffect(() => {
  localStorage.setItem("jr_companies", JSON.stringify(companies));
}, [companies]);

useEffect(() => {
  localStorage.setItem("jr_jobs", JSON.stringify(jobs));
}, [jobs]);
  
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { font-size: 16px; }
        html, body, #root {
          width: 100%;
          min-height: 100vh;
          background: ${C.bg};
          overflow-x: hidden;
        }
        button { cursor: pointer; transition: all 0.15s; border: none; }
        button:active { transform: scale(0.96); }
        button:hover { filter: brightness(1.12); }
        input, textarea, select { outline: none; box-sizing: border-box; }
        textarea { display: block; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
        option { background: ${C.surf2}; }
      `}</style>

      <div style={{
        width: "100%",
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: "'JetBrains Mono', monospace",
        display: "flex",
        flexDirection: "column",
      }}>

        {/* Header */}
        <header style={{
          borderBottom: `1px solid ${C.border}`,
          padding: "16px clamp(16px, 5vw, 48px)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 14, background: C.surf,
        }}>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(20px, 4vw, 34px)", fontWeight: 700, letterSpacing: 5, lineHeight: 1 }}>
              JOB<span style={{ color: C.accent }}>RADAR</span>
            </div>
            <div style={{ fontSize: "clamp(7px, 1vw, 9px)", color: C.muted, letterSpacing: 2.5, marginTop: 4 }}>INTELLIGENT CAREER TRACKER</div>
          </div>
          <div style={{ display: "flex", gap: "clamp(16px, 4vw, 40px)" }}>
            {[["WATCHING", watched.length, C.accent], ["NEW", newCount, C.orange], ["APPLIED", appliedCount, C.indigo], ["INTERVIEWS", interviewCount, C.green]].map(([label, val, color]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "clamp(18px, 3.5vw, 30px)", fontWeight: 700, color, fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: "clamp(6px, 1vw, 8px)", color: C.muted, letterSpacing: 1.5, marginTop: 3 }}>{label}</div>
              </div>
            ))}
          </div>
        </header>

        {/* Nav */}
        <nav style={{ display: "flex", background: C.surf, borderBottom: `1px solid ${C.border}` }}>
          {TABS.map(([t, icon, label]) => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "12px 4px",
              fontSize: "clamp(7px, 1.8vw, 10px)", letterSpacing: 1,
              color: tab === t ? C.accent : C.muted,
              borderBottom: `2px solid ${tab === t ? C.accent : "transparent"}`,
              background: "transparent",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              <span style={{ display: "block", fontSize: "clamp(14px, 3vw, 20px)", marginBottom: 4 }}>{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div style={{
          flex: 1,
          padding: "18px clamp(16px, 5vw, 48px) 80px",
          width: "100%",
        }}>
          {tab === "feed" && (
            <FeedTab
              jobs={feedJobs} companies={watched}
              fCompany={fCompany} setFCompany={setFCompany}
              fPlatform={fPlatform} setFPlatform={setFPlatform}
              fNew={fNew} setFNew={setFNew}
              expandedJob={expandedJob} setExpandedJob={setExpandedJob}
              scoringId={scoringId} setStatus={setStatus} handleScore={handleScore}
            />
          )}
          {tab === "tracker"   && <TrackerTab kanban={kanban} setStatus={setStatus} />}
          {tab === "companies" && (
            <CompaniesTab
              companies={companies} toggleCompany={toggleCompany}
              newCoName={newCoName} setNewCoName={setNewCoName}
              selPlatforms={selPlatforms} setSelPlatforms={setSelPlatforms}
              addCompany={addCompany}
            />
          )}
          {tab === "resume" && (
            <ResumeTab
              resume={resume} setResume={setResume}
              resumeStored={resumeStored} setResumeStored={setResumeStored}
            />
          )}
        </div>
      </div>
    </>
  );
}
