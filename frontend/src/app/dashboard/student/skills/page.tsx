'use client';

import { useEffect, useState, useMemo } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Trash2,
  X,
  Check,
  Target,
  Brain,
  TrendingUp,
  Briefcase,
  Zap,
  ShieldCheck,
  PlusCircle,
  Sparkles,
  Info,
  RotateCcw,
  ArrowRight,
  HelpCircle,
  LockOpen,
  Trophy
} from "lucide-react";
import clsx from 'clsx';
import apiClient from "@/lib/axios";

// ── 1. CORE DATA & WEIGHTS ────────────────────────────────────────────────

const ROLE_WEIGHTS: Record<string, Record<string, number>> = {
  "Frontend Developer": { "React": 3, "JavaScript": 2, "TypeScript": 2, "Tailwind": 1, "Next.js": 2, "Redux": 1 },
  "Backend Developer": { "Python": 3, "Django": 3, "PostgreSQL": 2, "Docker": 2, "Redis": 1, "REST API": 2 },
  "Full Stack Developer": { "React": 2, "Node.js": 2, "MongoDB": 1, "Docker": 1, "TypeScript": 2, "SQL": 1 },
  "DevOps Engineer": { "Docker": 3, "AWS": 3, "Kubernetes": 2, "CI/CD": 2, "Linux": 1, "Terraform": 2 }
};

const ALL_ROLES = Object.keys(ROLE_WEIGHTS);

// ── 2. UTILITY LOGIC ─────────────────────────────────────────────────────

function calculateWeightedMatch(userSkills: string[], role: string) {
  const weights = ROLE_WEIGHTS[role];
  if (!weights) return 0;

  const roleSkills = Object.keys(weights);
  let totalWeight = 0;
  let matchedWeight = 0;

  roleSkills.forEach(skill => {
    const weight = weights[skill];
    totalWeight += weight;
    if (userSkills.some(u => u.toLowerCase() === skill.toLowerCase())) {
      matchedWeight += weight;
    }
  });

  return Math.round((matchedWeight / totalWeight) * 100);
}

function calculateSkillImpact(skill: string) {
  let count = 0;
  ALL_ROLES.forEach(role => {
    if (Object.keys(ROLE_WEIGHTS[role]).some(s => s.toLowerCase() === skill.toLowerCase())) {
      count++;
    }
  });
  return Math.round((count / ALL_ROLES.length) * 100);
}

function getStrategicGaps(userSkills: string[], role: string) {
  const weights = ROLE_WEIGHTS[role];
  const roleSkills = Object.keys(weights);

  return roleSkills
    .filter(skill => !userSkills.some(u => u.toLowerCase() === skill.toLowerCase()))
    .sort((a, b) => (weights[b] || 1) - (weights[a] || 1));
}

// ────────────────────────────────────────────────────────────────────────────

export default function SkillsPage() {
  const router = useRouter();
  const { user, updateUser, isLoading: profileLoading } = useUser();
  const [skillsData, setSkillsData] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [simulatedSkills, setSimulatedSkills] = useState<string[]>([]);
  const [highlightedRoles, setHighlightedRoles] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [newSkill, setNewSkill] = useState("");

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/skills/student-skills/');
      const data = Array.isArray(res.data) ? res.data : [];
      // Assuming res.data returns [{ name: "React" }, { name: "Python" }]
      setSkillsData(data.map((s: any) => s.name || s.skill_name || s));
    } catch (err) {
      console.error("Failed to fetch skills:", err);
      setSkillsData(user.skills || []); // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  // Combined Active Skills
  const activeSkills = useMemo(() => [...skillsData, ...simulatedSkills], [skillsData, simulatedSkills]);

  // Base Analytics (for comparison)
  const baseAnalytics = useMemo(() => {
    const roleMatches = ALL_ROLES.map(role => ({
      role,
      pct: calculateWeightedMatch(skillsData, role)
    }));
    return { roleMatches };
  }, [skillsData]);

  // Current Analytics (Real-time Simulation Driven)
  const analytics = useMemo(() => {
    const roleMatches = ALL_ROLES.map(role => {
      const currentPct = calculateWeightedMatch(activeSkills, role);
      const basePct = baseAnalytics.roleMatches.find(b => b.role === role)?.pct || 0;
      const isUnlocked = basePct < 50 && currentPct >= 50;

      return {
        role,
        pct: currentPct,
        improvement: currentPct - basePct,
        isUnlocked,
        gaps: getStrategicGaps(activeSkills, role)
      };
    }).sort((a, b) => b.pct - a.pct);

    const allGaps = Array.from(new Set(roleMatches.flatMap(r => r.gaps)));
    const recommendations = allGaps.map(skill => ({
      skill,
      impact: calculateSkillImpact(skill),
      priority: calculateSkillImpact(skill) >= 50 ? "High" : "Medium"
    })).sort((a, b) => b.impact - a.impact).slice(0, 5);

    const marketFit = Math.round(roleMatches.reduce((acc, r) => acc + r.pct, 0) / roleMatches.length);
    const qualifiedCount = roleMatches.filter(r => r.pct >= 50).length;
    const baseQualifiedCount = baseAnalytics.roleMatches.filter(r => r.pct >= 50).length;

    // Smart Insight Generation
    const topRole = roleMatches[0];
    const topGap = topRole.gaps[0];
    const insight = `You are strongest in ${topRole.role} roles due to ${skillsData.length > 0 ? skillsData[0] : 'your expertise'}. Adding ${topGap || 'more specialized skills'} will significantly unlock ${roleMatches.find(r => r.pct < 50)?.role || 'advanced'} opportunities.`;

    return {
      roleMatches,
      recommendations,
      marketFit,
      qualifiedCount,
      unlockedCount: qualifiedCount - baseQualifiedCount,
      insight,
      topMatch: topRole
    };
  }, [activeSkills, baseAnalytics, skillsData]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const toggleSimulateSkill = (skill: string) => {
    if (skillsData.some(s => s.toLowerCase() === skill.toLowerCase())) return;

    const isAdding = !simulatedSkills.includes(skill);

    if (isAdding) {
      // Find roles that will improve
      const rolesToHighlight = analytics.roleMatches
        .filter(r => {
          const nextPct = calculateWeightedMatch([...activeSkills, skill], r.role);
          return nextPct > r.pct;
        })
        .map(r => r.role);

      setHighlightedRoles(rolesToHighlight);
      setTimeout(() => setHighlightedRoles([]), 2000);
    }

    setSimulatedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const applySimulation = async (skill: string) => {
    try {
      await apiClient.post('/skills/student-skills/', { name: skill });
      setSimulatedSkills(prev => prev.filter(s => s !== skill));
      showToast(`${skill} added to profile!`);
      fetchSkills();
    } catch (err) {
      console.error("Failed to add skill:", err);
    }
  };

  const handleAddSkill = async () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    try {
      await apiClient.post('/skills/student-skills/', { name: trimmed });
      setNewSkill("");
      showToast("Skill added!");
      fetchSkills();
    } catch (err) {
      console.error("Failed to add skill:", err);
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-slate-400">Initializing Engine...</div>;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto pb-24 animate-in fade-in duration-700">

      {/* Simulation Feedback Badge */}
      {analytics.unlockedCount > 0 && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-2 rounded-full shadow-2xl z-50 flex items-center gap-2 animate-bounce font-black text-xs tracking-widest uppercase">
          <LockOpen className="w-4 h-4" />
          +{analytics.unlockedCount} Role Unlocked!
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Skill Intelligence</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            AI-powered growth simulation and gap analysis
          </p>
        </div>

        <div className="flex items-center gap-3">
          {simulatedSkills.length > 0 && (
            <button onClick={() => setSimulatedSkills([])} className="p-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-2xl transition-all" title="Reset Simulation">
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 flex gap-4">
            <div className="px-4 py-1 text-center border-r border-slate-100 dark:border-slate-800">
              <p className="text-xl font-black text-slate-900 dark:text-white">{skillsData.length}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real</p>
            </div>
            <div className="px-4 py-1 text-center">
              <p className={clsx("text-xl font-black transition-all", simulatedSkills.length > 0 ? "text-blue-600 scale-110" : "text-slate-300")}>
                {simulatedSkills.length > 0 ? `+${simulatedSkills.length}` : '0'}
              </p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sim</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 1. BEST ROLE MATCH & SUMMARY ──────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 sm:p-10 mb-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -mr-48 -mt-48 transition-opacity group-hover:opacity-100 opacity-50" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/20 rounded-2xl">
                  <Trophy className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Best Role Match</h2>
                  <p className="text-blue-300/60 text-[10px] font-black uppercase tracking-[0.2em]">{analytics.topMatch.role}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
                  <p className="text-3xl font-black text-white">{analytics.topMatch.pct}%</p>
                  <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mt-1">Alignment</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
                  <p className="text-3xl font-black text-emerald-400">{skillsData.length}</p>
                  <p className="text-[10px] font-black text-emerald-300/70 uppercase tracking-widest mt-1">Core Skills Detected</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-white/5 rounded-[2rem] border border-white/5 max-w-xl">
                <Brain className="w-5 h-5 text-blue-400 shrink-0 mt-1" />
                <p className="text-sm font-medium text-blue-50/80 leading-relaxed italic">
                  "{analytics.insight}"
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 bg-white/5 border border-white/10 p-8 rounded-[3rem] text-center min-w-[240px]">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-8 border-white/5 flex items-center justify-center">
                  <p className="text-4xl font-black text-white">{analytics.marketFit}%</p>
                </div>
                <svg className="absolute top-0 left-0 w-32 h-32 -rotate-90">
                  <circle
                    cx="64" cy="64" r="56"
                    fill="none" stroke="currentColor"
                    strokeWidth="8" className="text-blue-500"
                    strokeDasharray="351.8"
                    strokeDashoffset={351.8 - (351.8 * analytics.marketFit) / 100}
                  />
                </svg>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1.5 group cursor-help relative">
                  <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Market Fit Score</p>
                  <HelpCircle className="w-3 h-3 text-blue-300/50" />
                  <div className="absolute bottom-full mb-2 w-48 p-2 bg-slate-900 text-[10px] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    Average alignment across all roles in the system.
                  </div>
                </div>
                <p className="text-white/50 text-xs mt-1 font-medium italic">Calculated using weighted skill alignment</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* ── 2. ROLE MATCHING ENGINE ──────────────────────────────────── */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Weighted Match Engine</h2>
            </div>
            <div title="Calculated as (sum of matched skill weights / total role weights) * 100">
              <HelpCircle className="w-4 h-4 text-slate-300" />
            </div>
          </div>

          <div className="space-y-6">
            {analytics.roleMatches.map(r => (
              <div key={r.role} className={clsx(
                "relative transition-all duration-500 rounded-2xl p-2 -m-2",
                highlightedRoles.includes(r.role) && "bg-emerald-500/5 ring-1 ring-emerald-500/20"
              )}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    {r.role}
                    {r.isUnlocked && (
                      <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase font-black animate-pulse">Unlocked</span>
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    {r.improvement > 0 && (
                      <span className="text-[10px] font-black text-emerald-600">+{r.improvement}%</span>
                    )}
                    <span className={clsx(
                      "text-sm font-black transition-all duration-700",
                      r.pct >= 50 ? "text-emerald-600" : "text-rose-500"
                    )}>{r.pct}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={clsx(
                      "h-full transition-all duration-1000 ease-out",
                      r.pct >= 50 ? "bg-emerald-500" : "bg-rose-500",
                      highlightedRoles.includes(r.role) && "animate-pulse"
                    )}
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Strategic Gaps:</span>
                  {r.gaps.slice(0, 3).map(g => (
                    <span key={g} className="text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700 transition-opacity">
                      {g}
                    </span>
                  ))}
                  {r.gaps.length > 3 && <span className="text-[9px] font-bold text-slate-400">+{r.gaps.length - 3}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. STRATEGIC ROADMAP (SIMULATION) ───────────────────────── */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Growth Roadmap</h2>
          </div>

          <div className="space-y-4">
            {analytics.recommendations.map(rec => {
              const isSimulated = simulatedSkills.includes(rec.skill);
              return (
                <div
                  key={rec.skill}
                  className={clsx(
                    "flex items-center justify-between p-5 rounded-3xl border transition-all duration-500",
                    isSimulated
                      ? "bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/30 -translate-y-1"
                      : "bg-slate-50 dark:bg-slate-800/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700 group"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={clsx(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                      isSimulated ? "bg-white/20 text-white scale-110" : "bg-white dark:bg-slate-900 text-slate-300 group-hover:text-blue-600"
                    )}>
                      {isSimulated ? <Check className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className={clsx("text-sm font-black", isSimulated ? "text-white" : "text-slate-900 dark:text-white")}>{rec.skill}</p>
                      <div className="flex items-center gap-2 mt-1 group/impact cursor-help relative">
                        <p className={clsx("text-[10px] font-bold uppercase tracking-widest", isSimulated ? "text-white/80" : "text-emerald-600")}>
                          +{rec.impact}% market reach
                        </p>
                        <Info className={clsx("w-3 h-3", isSimulated ? "text-white/40" : "text-slate-300")} />
                        <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-slate-900 text-[10px] text-white rounded-lg opacity-0 group-hover/impact:opacity-100 transition-opacity pointer-events-none z-50">
                          Impact based on demand across roles in the system.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSimulated && (
                      <button
                        onClick={() => applySimulation(rec.skill)}
                        className="px-4 py-2 bg-white text-blue-600 text-[10px] font-black rounded-xl hover:bg-blue-50 transition-all active:scale-95 shadow-sm"
                      >
                        APPLY
                      </button>
                    )}
                    <button
                      onClick={() => toggleSimulateSkill(rec.skill)}
                      className={clsx(
                        "p-3 rounded-2xl transition-all",
                        isSimulated
                          ? "bg-white/10 text-white hover:bg-white/20"
                          : "bg-white dark:bg-slate-900 text-slate-400 hover:text-blue-600 shadow-sm border border-slate-100 dark:border-slate-700"
                      )}
                    >
                      {isSimulated ? <X className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ── 4. CAREER TRAJECTORY INSIGHTS ───────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-10 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-10">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-500/40">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Career Trajectory</h3>
              <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Real-Time Placement Outlook</p>
            </div>
          </div>
          <p className="text-lg font-bold text-slate-700 dark:text-slate-300 leading-relaxed max-w-xl">
            You currently qualify for <span className="text-blue-600 dark:text-blue-400 font-black">{analytics.qualifiedCount} out of {ALL_ROLES.length}</span> roles.
            {analytics.recommendations.length > 0 && (
              <> Adding <span className="font-black text-slate-900 dark:text-white">{analytics.recommendations[0].skill}</span> and <span className="font-black text-slate-900 dark:text-white">{analytics.recommendations[1]?.skill}</span> can unlock {ALL_ROLES.length - analytics.qualifiedCount} additional roles.</>
            )}
          </p>
        </div>

        <button
          onClick={() => router.push('/dashboard/student/job-matches')}
          className="px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-[2rem] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-slate-200 dark:shadow-none flex items-center gap-3 whitespace-nowrap"
        >
          View Job Matches
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Manual Input */}
      <div className="mt-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              placeholder="Filter your active intelligence nodes..."
              className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex-[1.5] flex gap-2">
            <input
              type="text"
              placeholder="Register new validated skill..."
              className="flex-1 px-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleAddSkill()}
            />
            <button
              onClick={handleAddSkill}
              className="px-10 bg-blue-600 text-white font-black text-sm rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}