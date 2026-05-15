'use client';

import { useState, useRef } from "react";
import api from "@/lib/axios";
import {
  UploadCloud, FileText, X, AlertCircle, Sparkles,
  Download, RefreshCw, Zap, CheckCircle, ChevronRight,
  ShieldCheck, TriangleAlert, TrendingUp, Info, PenTool
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

interface CriticalBlocker { issue: string; severity: "High" | "Medium" | "Low"; }
interface ImpactItem      { fix: string; boost: number; }
interface RoleReadiness   { role: string; readiness: number; }
interface AtsIssue        { issue: string; severity: "High" | "Medium" | "Low"; }

interface AnalysisResult {
  score: number;
  ats_score: number;
  summary: string;
  final_verdict: "Strong Hire" | "Potential Hire" | "Not Ready";
  ai_confidence: number;
  experience_level: string;
  recommended_role: string;
  why_verdict: string[];

  skills: string[];
  missing_skills: string[];
  skill_match: Record<string, number>;

  strengths: string[];
  weaknesses: string[];
  score_explanation: string[];

  ats_breakdown: {
    formatting: number; keyword_optimization: number;
    experience_clarity: number; projects_quality: number; readability: number;
  };
  ats_issues: AtsIssue[];
  critical_blockers: CriticalBlocker[];
  impact_simulation: ImpactItem[];
  role_readiness: RoleReadiness[];

  suggestions: string[];
  resume_improvements: string[];

  matched_jobs: number;
  experience: boolean;
  education: boolean;
  projects_analysis: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const CIRC = 2 * Math.PI * 48;

function DonutScore({ value, color }: { value: number; color: string }) {
  const offset = CIRC - (CIRC * value) / 100;
  return (
    <svg className="-rotate-90" width={112} height={112} viewBox="0 0 112 112">
      <circle cx="56" cy="56" r="48" strokeWidth="9" fill="none" stroke="#e5e7eb" />
      <circle cx="56" cy="56" r="48" strokeWidth="9" fill="none"
        stroke={color} strokeDasharray={CIRC} strokeDashoffset={offset}
        strokeLinecap="round" className="transition-all duration-1000 ease-out" />
    </svg>
  );
}

function BarRow({ label, value }: { label: string; value: number }) {
  const bg = value >= 80 ? "bg-emerald-500" : value >= 60 ? "bg-amber-500" : "bg-rose-500";
  const tx = value >= 80 ? "text-emerald-600" : value >= 60 ? "text-amber-600" : "text-rose-600";
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-sm font-bold text-gray-700 capitalize">{label.replaceAll("_", " ")}</span>
        <span className={`text-xs font-bold ${tx}`}>{value}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full ${bg} transition-all duration-1000`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

// simulated potential score capped at 92
function potentialScore(current: number, items: ImpactItem[]) {
  return Math.min(92, current + items.reduce((acc, i) => acc + i.boost, 0));
}

// ATS issue severity config
const severityConfig = {
  High:   { bg: "bg-red-50",    border: "border-red-200",    badge: "bg-red-600 text-white",    icon: "text-red-500"   },
  Medium: { bg: "bg-amber-50",  border: "border-amber-200",  badge: "bg-amber-500 text-white",  icon: "text-amber-500" },
  Low:    { bg: "bg-blue-50",   border: "border-blue-200",   badge: "bg-blue-500 text-white",   icon: "text-blue-500"  },
} as const;

// ── Page ───────────────────────────────────────────────────────────────────

export default function ResumeAnalyzerPage() {
  const [file,      setFile]      = useState<File | null>(null);
  const [isDragging,setIsDragging]= useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [result,    setResult]    = useState<AnalysisResult | null>(null);
  const [showImproveModal, setShowImproveModal] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const pick = (f: File) => {
    if (f.type !== "application/pdf") { setError("PDF only"); return; }
    setError(""); setFile(f); setResult(null);
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true); setError("");
    try {
      console.log("TOKEN:", localStorage.getItem("access_token"));
      const fd = new FormData(); fd.append("resume", file);
      const res = await api.post("/resume/analyze/", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setResult(res.data);
    } catch (error: any) { 
      console.log("API ERROR:", error.response?.status);
      setError("Analysis failed. Please try again."); 
    }
    finally { setLoading(false); }
  };

  const download = async () => {
    if (!result) return;
    try {
      const res = await api.get("/analyzer/download-report/", { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'resume-analysis-report.docx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download report. Please try again.");
    }
  };

  // ── Upload screen ────────────────────────────────────────────────────────
  if (!result) return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto pb-24">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">Resume Analyzer</h2>
        <p className="text-gray-500 mt-1.5 font-medium">Get a hiring-grade AI + ATS evaluation in seconds.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center font-semibold text-sm">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />{error}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) pick(e.dataTransfer.files[0]); }}
          onClick={() => !loading && ref.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all
            ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50/80"}
            ${loading ? "opacity-50 pointer-events-none" : ""}`}>
          <input ref={ref} type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && pick(e.target.files[0])} />
          {file ? (
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3"><FileText className="w-7 h-7"/></div>
              <p className="font-bold text-gray-900 text-lg">{file.name}</p>
              <p className="text-sm text-gray-400 font-mono mt-1">{(file.size/1024/1024).toFixed(2)} MB</p>
              <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="mt-3 text-sm text-red-500 hover:text-red-700 font-semibold flex items-center gap-1">
                <X className="w-3.5 h-3.5"/>Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3"><UploadCloud className="w-7 h-7"/></div>
              <p className="font-bold text-gray-900 text-lg mb-1">Click or drag & drop your resume</p>
              <p className="text-gray-400 text-sm">PDF only</p>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={analyze} disabled={!file || loading}
            className="px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">
            {loading ? (
              <><svg className="animate-spin mr-2.5 h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Analyzing with AI…</>
            ) : (
              <><Sparkles className="w-5 h-5 mr-2"/>Upload & Analyze</>
            )}
          </button>
        </div>
      </div>

      <div className="mt-6 text-center py-14 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl">
        <ShieldCheck className="w-12 h-12 text-blue-200 mx-auto mb-3"/>
        <p className="text-gray-400 font-medium">Your AI hiring verdict will appear here</p>
      </div>
    </div>
  );

  // ── Results ───────────────────────────────────────────────────────────────
  const { final_verdict, score, ats_score, ai_confidence } = result;

  const verdictConfig = {
    "Strong Hire":    { bg: "bg-emerald-600", icon: "🟢", sub: "This resume is competitive and ready to send." },
    "Potential Hire": { bg: "bg-amber-500",   icon: "🟡", sub: "Good foundation but key gaps need fixing before applying." },
    "Not Ready":      { bg: "bg-rose-600",    icon: "🔴", sub: "Significant improvements needed before this resume can pass ATS." },
  }[final_verdict] ?? { bg: "bg-gray-500", icon: "⚪", sub: "" };

  const scoreColor  = score >= 80 ? "#22c55e" : score >= 60 ? "#3b82f6" : "#f59e0b";
  const atsColor    = ats_score >= 80 ? "#22c55e" : ats_score >= 60 ? "#f59e0b" : "#ef4444";
  const potential   = potentialScore(score, result.impact_simulation ?? []);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto pb-28 space-y-5">

      {/* ── Header ---------------------------------------------------------- */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">Resume Analyzer</h2>
          <p className="text-gray-500 mt-1 font-medium text-sm">AI hiring verdict · ATS analysis · Specific fixes</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={download} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 flex items-center shadow-sm">
            <Download className="w-4 h-4 mr-1.5"/>Report
          </button>
          <button onClick={() => { setResult(null); setFile(null); }} className="px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-100 flex items-center">
            <RefreshCw className="w-4 h-4 mr-1.5"/>Re-analyze
          </button>
          <button 
            onClick={() => setShowImproveModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 flex items-center shadow-sm"
          >
            <Zap className="w-4 h-4 mr-1.5"/>Improve with AI
          </button>
        </div>
      </div>

      {/* ── 1. VERDICT BANNER ----------------------------------------------- */}
      <div className={`${verdictConfig.bg} rounded-3xl p-6 sm:p-8`}>
        {/* Top row: verdict title + scores */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-4">
            <span className="text-5xl leading-none">{verdictConfig.icon}</span>
            <div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-0.5">Hiring Verdict</p>
              <h3 className="text-white text-4xl font-black leading-none">{final_verdict}</h3>
              <p className="text-white/75 font-semibold text-sm mt-2 max-w-xs leading-snug">{verdictConfig.sub}</p>
            </div>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">Resume</p>
              <p className="text-white text-3xl font-black">{score}%</p>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">ATS</p>
              <p className="text-white text-3xl font-black">{ats_score}%</p>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">Confidence</p>
              <p className="text-white text-3xl font-black">{ai_confidence}%</p>
            
            </div>
          </div>
        </div>

        {/* Why this decision — always shown, prominent bullet list */}
        <div className="border-t border-white/20 pt-5">
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">Why this decision?</p>
          {result.why_verdict?.length > 0 ? (
            <ol className="space-y-2">
              {result.why_verdict.slice(0, 3).map((reason, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 text-white text-xs font-black flex items-center justify-center mt-0.5">{i + 1}</span>
                  <span className="text-sm font-semibold text-white/90 leading-snug">{reason}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-white/60 text-sm font-semibold">Parsing completed — see score breakdown below for details.</p>
          )}
        </div>
      </div>

      {/* ── 2. CRITICAL BLOCKERS (moved up — priority 2) --------------------- */}
      {result.critical_blockers?.length > 0 && (
        <div className="bg-white border-2 border-rose-200 rounded-3xl p-6 sm:p-8">
          <div className="flex items-start justify-between mb-1">
            <h4 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
              <TriangleAlert className="w-5 h-5 text-rose-600"/>Critical Blockers
            </h4>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">Must fix before applying</span>
          </div>
          <p className="text-gray-500 text-xs font-semibold mb-5">These issues directly reduce shortlist probability. Address them in order.</p>
          <div className="space-y-3">
            {result.critical_blockers.map((b, i) => (
              <div key={i} className={`flex items-start bg-gray-50 rounded-2xl p-4 border-l-4 ${
                b.severity === "High" ? "border-l-rose-500" : b.severity === "Medium" ? "border-l-amber-400" : "border-l-blue-400"
              } border border-gray-100`}>
                <span className={`flex-shrink-0 text-xs font-black px-2 py-0.5 rounded-md mr-3 mt-0.5 ${
                  b.severity === "High" ? "bg-rose-600 text-white" : b.severity === "Medium" ? "bg-amber-500 text-white" : "bg-blue-500 text-white"
                }`}>{b.severity}</span>
                <span className="text-sm font-semibold text-gray-800 leading-relaxed">{b.issue}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. SCORE ROW (moved after blockers — priority 3) ----------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Resume Score */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col items-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Resume Strength</p>
          <div className="relative">
            <DonutScore value={score} color={scoreColor}/>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-black text-gray-900">{score}%</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 font-semibold mt-4 text-center">
            {score >= 80 ? "Competitive — ready to apply" : score >= 60 ? "Solid base — close gaps first" : "Below hiring threshold — major improvements needed"}
          </p>
        </div>

        {/* ATS Score */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col items-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">ATS Score</p>
          <div className="relative">
            <DonutScore value={ats_score} color={atsColor}/>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-black text-gray-900">{ats_score}%</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 font-semibold mt-4 text-center">
            {ats_score >= 80 ? "Passes most ATS filters ✓" : ats_score >= 60 ? "Borderline — keyword gaps present" : "High risk of being filtered before human review"}
          </p>
        </div>

        {/* Recruiter Summary */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500"/>Recruiter Read
            </p>
            <p className="text-sm text-gray-700 font-medium leading-relaxed line-clamp-5">{result.summary}</p>
          </div>
          <div className="mt-4 flex gap-2 flex-wrap">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
              {result.experience_level} Level
            </span>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-lg">
              {result.recommended_role}
            </span>
          </div>
        </div>
      </div>

      {/* Critical Blockers rendered above score row — see priority 2 block */}

      {/* ── 4. IMPACT SIMULATION -------------------------------------------- */}
      {result.impact_simulation?.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 sm:p-8">
          <h4 className="text-lg font-extrabold text-gray-900 mb-1 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600"/>Impact Simulation
          </h4>
          <p className="text-xs text-gray-400 font-semibold mb-6">Fixing these can bring your score to ~<span className="font-black text-emerald-600">{potential}%</span> (max ~92%)</p>
          <div className="space-y-3 mb-6">
            {result.impact_simulation.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-5 py-3">
                <div className="flex items-center gap-3">
                  <ChevronRight className="w-4 h-4 text-emerald-600 flex-shrink-0"/>
                  <span className="text-sm font-semibold text-gray-800">{item.fix}</span>
                </div>
                <span className="text-sm font-black text-emerald-700 flex-shrink-0 ml-4">+{item.boost}%</span>
              </div>
            ))}
          </div>
          <div className="bg-emerald-600 rounded-2xl px-6 py-4 flex items-center justify-between">
            <span className="text-white font-bold">👉 Potential Score after fixes</span>
            <span className="text-white text-2xl font-black">{potential}%</span>
          </div>
        </div>
      )}

      {/* ── 5. ATS DEEP ANALYSIS + ATS ISSUES ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-3xl border border-purple-100 shadow-sm p-6 sm:p-8">
          <h4 className="text-base font-extrabold text-gray-900 mb-6 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-600"/>ATS Deep Breakdown
          </h4>
          <div className="space-y-5">
            {result.ats_breakdown && Object.entries(result.ats_breakdown).map(([k, v]) => (
              <BarRow key={k} label={k} value={v}/>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-amber-100 shadow-sm p-6 sm:p-8">
          <h4 className="text-base font-extrabold text-gray-900 mb-1 flex items-center gap-2">
            <TriangleAlert className="w-5 h-5 text-amber-500"/>ATS Pattern Failures
          </h4>
          <p className="text-xs text-gray-400 font-semibold mb-5">ATS engines score these patterns automatically — fix <span className="text-red-600 font-bold">High</span> severity first to avoid rejection before human review</p>
          {result.ats_issues?.length > 0 ? (
            <ul className="space-y-3">
              {result.ats_issues.map((item, i) => {
                // Handle both legacy string format and new {issue, severity} object format
                const issueText = typeof item === "string" ? item : item.issue;
                const sev: "High" | "Medium" | "Low" = typeof item === "string" ? "Medium" : item.severity;
                const cfg = severityConfig[sev];
                return (
                  <li key={i} className={`flex items-start ${cfg.bg} border ${cfg.border} rounded-xl p-3.5`}>
                    <span className={`flex-shrink-0 text-xs font-black px-2 py-0.5 rounded-md mr-3 mt-0.5 ${cfg.badge}`}>{sev}</span>
                    <span className={`text-sm font-semibold text-gray-800 leading-relaxed`}>{issueText}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="bg-green-50 border border-green-100 rounded-xl p-5 text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2"/>
              <p className="text-green-700 font-semibold text-sm">No major ATS issues detected</p>
            </div>
          )}
        </div>
      </div>

      {/* ── 6. ROLE READINESS + SKILLS ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Role Readiness */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h4 className="text-base font-extrabold text-gray-900 mb-5">Role Readiness</h4>
          <div className="space-y-4">
            {(result.role_readiness ?? []).map((r, i) => {
              const bg = r.readiness >= 75 ? "bg-emerald-500" : r.readiness >= 55 ? "bg-blue-500" : "bg-gray-300";
              return (
                <div key={i} className={`rounded-2xl border p-4 ${i === 0 ? "border-indigo-200 bg-indigo-50" : "border-gray-100 bg-gray-50"}`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      {i === 0 && <span className="text-xs bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-md">Best Fit</span>}
                      <span className={`font-bold text-sm ${i === 0 ? "text-indigo-800" : "text-gray-700"}`}>{r.role}</span>
                    </div>
                    <span className={`font-black text-sm ${i === 0 ? "text-indigo-600" : "text-gray-500"}`}>{r.readiness}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${bg} transition-all duration-1000`} style={{ width: `${r.readiness}%` }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Skill Densities */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h4 className="text-base font-extrabold text-gray-900 mb-5">Skill Density Analysis</h4>
          {Object.keys(result.skill_match ?? {}).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(result.skill_match).slice(0, 8).map(([skill, val]) => {
                const bg = val >= 75 ? "bg-emerald-500" : val >= 50 ? "bg-blue-500" : "bg-amber-400";
                const tx = val >= 75 ? "text-emerald-600" : val >= 50 ? "text-blue-600" : "text-amber-600";
                return (
                  <div key={skill}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm font-bold text-gray-700 capitalize">{skill}</span>
                      <span className={`text-xs font-bold ${tx}`}>{val}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${bg} transition-all duration-1000`} style={{ width: `${val}%` }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm bg-gray-50 p-4 rounded-xl">No skills detected from resume text.</p>
          )}
          {result.missing_skills?.length > 0 && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">Missing Critical Skills</p>
              <div className="flex flex-wrap gap-2">
                {result.missing_skills.map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-semibold line-through decoration-red-300">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 7. WHY THIS SCORE + SUGGESTIONS + EDITS ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Why this score */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h4 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500"/>Why This Score?
          </h4>
          <div className="space-y-2.5">
            {result.score_explanation?.map((exp, i) => (
              <div key={i} className="flex items-start text-sm font-medium text-gray-700 bg-blue-50 border border-blue-100 p-3 rounded-xl">
                <ChevronRight className="w-4 h-4 mr-1.5 mt-0.5 text-blue-500 flex-shrink-0"/>{exp}
              </div>
            ))}
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="bg-white rounded-3xl border border-indigo-100 shadow-sm p-6">
          <h4 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600"/>Actionable Fixes
          </h4>
          <div className="space-y-2.5">
            {result.suggestions?.map((s, i) => (
              <div key={i} className="flex items-start bg-indigo-50 border border-indigo-50 p-3 rounded-xl">
                <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-700 font-black text-xs rounded-full flex items-center justify-center mr-2.5 mt-0.5">{i+1}</span>
                <span className="text-xs text-gray-700 font-semibold leading-relaxed">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Resume Document Edits */}
        <div className="bg-white rounded-3xl border border-purple-100 shadow-sm p-6">
          <h4 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
            <PenTool className="w-4 h-4 text-purple-600"/>Document Edits
          </h4>
          <div className="space-y-2.5">
            {result.resume_improvements?.length > 0 ? result.resume_improvements.map((imp, i) => (
              <div key={i} className="flex items-start bg-purple-50 border border-purple-50 p-3 rounded-xl">
                <span className="flex-shrink-0 w-5 h-5 bg-purple-100 text-purple-700 font-black text-xs rounded-full flex items-center justify-center mr-2.5 mt-0.5">{i+1}</span>
                <span className="text-xs text-gray-700 font-semibold leading-relaxed">{imp}</span>
              </div>
            )) : (
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-1.5"/>
                <p className="text-green-700 font-semibold text-xs">No critical document edits required</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 8. AI IMPROVEMENT MODAL ─────────────────────────────────────── */}
      {showImproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">AI Career Accelerator</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Strategic improvements to boost hiring readiness</p>
                </div>
              </div>
              <button 
                onClick={() => setShowImproveModal(false)}
                className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              {/* Strategic Suggestions */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Growth Roadmap</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.suggestions?.map((s, i) => (
                    <div key={i} className="p-5 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 rounded-3xl group hover:bg-blue-600 hover:border-blue-600 transition-all duration-300">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-950 flex items-center justify-center text-[10px] font-black text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                          {i + 1}
                        </div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-white transition-colors leading-relaxed">
                          {s}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Document Edits */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <PenTool className="w-5 h-5 text-purple-500" />
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Precision Document Edits</h4>
                </div>
                <div className="space-y-4">
                  {result.resume_improvements?.map((imp, i) => (
                    <div key={i} className="flex items-start gap-4 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-700/50">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400 mt-1">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed">{imp}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Implementation Tip: Apply to current role first</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Impact Simulation Preview */}
              <section className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                  <Zap className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-70">Simulation Result</h4>
                  <div className="flex items-center justify-between gap-8">
                    <div>
                      <p className="text-3xl font-black mb-2">Reach {(result.score + 15).toFixed(0)}% Match Rate</p>
                      <p className="text-sm font-bold text-indigo-100 max-w-md">By applying these strategic document edits and closing technical gaps, you move into the top 5% of candidate pool for {result.recommended_role} roles.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">Potential Score</p>
                      <p className="text-5xl font-black">92%</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Modal Footer */}
            <div className="p-8 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-4">
              <button 
                onClick={() => setShowImproveModal(false)}
                className="px-8 py-3.5 text-slate-500 font-black text-xs uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Dismiss
              </button>
              <button 
                onClick={() => { setShowImproveModal(false); download(); }}
                className="px-10 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                Download Full Roadmap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
