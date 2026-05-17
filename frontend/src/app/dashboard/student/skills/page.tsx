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
  Trophy,
  Loader2
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
    if (userSkills.some(u => typeof u === 'string' && u.toLowerCase() === skill.toLowerCase())) {
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
    .filter(skill => !userSkills.some(u => typeof u === 'string' && u.toLowerCase() === skill.toLowerCase()))
    .sort((a, b) => (weights[b] || 1) - (weights[a] || 1));
}

// ────────────────────────────────────────────────────────────────────────────

export default function SkillsPage() {
  const router = useRouter();
  const { user, updateUser } = useUser();
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
      
      const sanitized = data.map((s: any) => {
        if (typeof s === 'string') return s;
        return s.skill_name || s.name || (s.skill && s.skill.name) || "";
      }).filter(s => !!s);
      
      setSkillsData(sanitized);
    } catch (err) {
      console.error("Failed to fetch skills:", err);
      // Fallback and sanitize
      const fallback = Array.isArray(user.skills) ? user.skills : [];
      setSkillsData(fallback.map(s => typeof s === 'string' ? s : String(s)).filter(s => !!s));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const activeSkills = useMemo(() => [...skillsData, ...simulatedSkills], [skillsData, simulatedSkills]);

  const baseAnalytics = useMemo(() => {
    const roleMatches = ALL_ROLES.map(role => ({
      role,
      pct: calculateWeightedMatch(skillsData, role)
    }));
    return { roleMatches };
  }, [skillsData]);

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

    const topRole = roleMatches[0] || { role: "N/A", pct: 0, gaps: [] };
    const topGap = topRole.gaps[0];
    const insight = skillsData.length > 0 
      ? `You are strongest in ${topRole.role} roles. Adding ${topGap || 'specialized technical nodes'} will maximize your market value.`
      : "Initialize your technical nodes to start AI career mapping.";

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
      showToast("Skill registered successfully!");
      fetchSkills();
    } catch (err) {
      console.error("Failed to add skill:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-slate-400 font-black text-xs uppercase tracking-[0.3em]">Calibrating Intelligence Engine</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto pb-24 animate-in fade-in duration-700">
      {analytics.unlockedCount > 0 && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-8 py-3 rounded-full shadow-2xl z-50 flex items-center gap-3 animate-bounce font-black text-[10px] tracking-[0.2em] uppercase border border-blue-400">
          <LockOpen className="w-4 h-4" />
          {analytics.unlockedCount} New Role Unlocked!
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Intelligence Mapping</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            AI-driven growth path and competitive analysis
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 flex gap-4 shadow-sm">
            <div className="px-5 py-1 text-center border-r border-slate-100 dark:border-slate-800">
              <p className="text-xl font-black text-slate-900 dark:text-white">{skillsData.length}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active</p>
            </div>
            <div className="px-5 py-1 text-center">
              <p className={clsx("text-xl font-black transition-all", simulatedSkills.length > 0 ? "text-blue-600 scale-110" : "text-slate-300")}>
                {simulatedSkills.length > 0 ? `+${simulatedSkills.length}` : '0'}
              </p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sim</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 dark:bg-slate-900/50 rounded-[3rem] p-10 mb-12 shadow-2xl border border-slate-800 relative overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white uppercase italic">{analytics.topMatch.role}</h2>
                  <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mt-1">Primary Skill Alignment</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <p className="text-4xl font-black text-white">{analytics.topMatch.pct}%</p>
                  <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em] mt-2">Accuracy</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <p className="text-4xl font-black text-emerald-400">{skillsData.length}</p>
                  <p className="text-[10px] font-black text-emerald-400/70 uppercase tracking-[0.2em] mt-2">Verified</p>
                </div>
              </div>

              <p className="text-blue-50/70 text-base font-medium leading-relaxed max-w-xl italic">
                "{analytics.insight}"
              </p>
            </div>

            <div className="flex flex-col items-center gap-6 bg-white/5 border border-white/10 p-10 rounded-[4rem] min-w-[280px]">
              <div className="relative">
                <div className="w-36 h-36 rounded-full border-8 border-white/5 flex items-center justify-center">
                  <p className="text-4xl font-black text-white">{analytics.marketFit}%</p>
                </div>
                <svg className="absolute top-0 left-0 w-36 h-36 -rotate-90">
                  <circle
                    cx="72" cy="72" r="64"
                    fill="none" stroke="currentColor"
                    strokeWidth="8" className="text-blue-600"
                    strokeDasharray="402"
                    strokeDashoffset={402 - (402 * analytics.marketFit) / 100}
                  />
                </svg>
              </div>
              <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.3em]">Market Reach Index</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-10">
            <Briefcase className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Role Precision</h2>
          </div>

          <div className="space-y-8">
            {analytics.roleMatches.map(r => (
              <div key={r.role}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-black text-slate-900 dark:text-white uppercase italic">{r.role}</p>
                  <div className="flex items-center gap-3">
                    {r.improvement > 0 && <span className="text-xs font-black text-emerald-600">+{r.improvement}%</span>}
                    <span className={clsx("text-base font-black italic", r.pct >= 50 ? "text-emerald-500" : "text-rose-500")}>{r.pct}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={clsx("h-full transition-all duration-1000", r.pct >= 50 ? "bg-emerald-500" : "bg-rose-500")}
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                   {r.gaps.slice(0, 3).map(g => (
                     <span key={g} className="text-[9px] font-black uppercase bg-slate-50 dark:bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-100 dark:border-slate-700">
                        {g}
                     </span>
                   ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-10">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Strategic Gaps</h2>
          </div>

          <div className="space-y-5">
            {analytics.recommendations.map(rec => {
              const isSimulated = simulatedSkills.includes(rec.skill);
              return (
                <div key={rec.skill} className={clsx(
                  "p-6 rounded-[2rem] border-2 transition-all duration-500 flex items-center justify-between group",
                  isSimulated ? "bg-blue-600 border-blue-500 text-white shadow-2xl -translate-y-1" : "bg-slate-50 dark:bg-slate-800/50 border-transparent hover:border-slate-200"
                )}>
                  <div className="flex items-center gap-5">
                    <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm", isSimulated ? "bg-white/20" : "bg-white dark:bg-slate-900 text-slate-300")}>
                      {isSimulated ? <Check /> : <Zap />}
                    </div>
                    <div>
                      <p className="text-base font-black uppercase italic">{rec.skill}</p>
                      <p className={clsx("text-[10px] font-black uppercase tracking-widest mt-1", isSimulated ? "text-blue-100" : "text-emerald-500")}>Impact: +{rec.impact}%</p>
                    </div>
                  </div>
                  <button onClick={() => toggleSimulateSkill(rec.skill)} className={clsx("p-4 rounded-2xl transition-all", isSimulated ? "bg-white/10 hover:bg-white/20" : "bg-white dark:bg-slate-900 text-slate-400 shadow-sm")}>
                    {isSimulated ? <X /> : <PlusCircle />}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
         <div className="flex-1">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic mb-2 tracking-tight">Intelligence Input</h3>
            <p className="text-slate-500 text-sm font-medium">Add verified technical nodes to your professional profile.</p>
         </div>
         <div className="flex-1 flex gap-3 w-full">
            <input 
              type="text"
              placeholder="e.g. AWS, Docker..."
              className="flex-1 px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 ring-blue-500/20"
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleAddSkill()}
            />
            <button onClick={handleAddSkill} className="px-10 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20">
              Register
            </button>
         </div>
      </div>
    </div>
  );
}