'use client';

import { useState, useMemo, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  Briefcase,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Search,
  Filter,
  Target,
  Zap,
  Check,
  Info,
  ArrowRight,
  Sparkles,
  AlertCircle,
  PlusCircle,
  X,
  RotateCcw,
  Trophy,
  Activity,
  TrendingUp
} from "@/components/Icons";
import clsx from 'clsx';

import apiClient from "@/lib/axios";

function calculateMatch(userSkills: string[], jobSkills: string[]) {
  if (!jobSkills || !Array.isArray(jobSkills) || jobSkills.length === 0) {
    return { pct: 0, matched: [], missing: [] };
  }
  const matched = jobSkills.filter(s =>
    userSkills.some(u => u.toLowerCase() === s.toLowerCase())
  );
  const pct = Math.round((matched.length / jobSkills.length) * 100);
  const missing = jobSkills.filter(s =>
    !userSkills.some(u => u.toLowerCase() === s.toLowerCase())
  );
  return { pct, matched, missing };
}

// ────────────────────────────────────────────────────────────────────────────

export default function JobMatchesPage() {
  const router = useRouter();
  const { user } = useUser();
  const [simulatedSkills, setSimulatedSkills] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [minMatch, setMinMatch] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [jobsData, setJobsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await apiClient.get('/jobs/match/');
        const data = Array.isArray(res.data) ? res.data : [];
        const mapped = data.map((job: any) => ({
          id: job.id,
          title: job.title,
          company: job.company || "Company",
          location: job.location || "Remote",
          skills: [], // API doesn't return job specific skills, default to empty
          description: job.description || "",
          backendMatchScore: job.match_score || 0
        }));
        setJobsData(mapped);
      } catch (err) {
        console.error("Failed to fetch job matches:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatches();
  }, []);

  // Simulation State: Unified Active Skills
  const activeSkills = useMemo(() => [...user.skills, ...simulatedSkills], [user.skills, simulatedSkills]);

  // Ranking Engine
  const processedJobs = useMemo(() => {
    return jobsData.map(job => {
      const current = calculateMatch(activeSkills, job.skills);
      const base = calculateMatch(user.skills, job.skills);
      const improvement = current.pct - base.pct;

      // "Why this job" insight logic
      const nextSkill = current.missing[0];
      const improvedPct = nextSkill ? calculateMatch([...activeSkills, nextSkill], job.skills).pct : current.pct;

      const insight = `You match ${current.matched.length}/${job.skills.length} skills. ${nextSkill ? `Adding ${nextSkill} increases your match to ${improvedPct}%.` : "You have achieved full core alignment for this role."
        }`;

      return {
        ...job,
        ...current,
        improvement,
        insight,
        nextSkill,
        potentialPct: improvedPct
      };
    }).sort((a, b) => b.pct - a.pct);
  }, [activeSkills, user.skills, jobsData]);

  // Global Dynamic Insight
  const globalInsight = useMemo(() => {
    const allMissing = Array.from(new Set(processedJobs.flatMap(j => j.missing)));
    const topMissing = allMissing.sort((a, b) => {
      const aCount = jobsData.filter(j => j.skills.includes(a)).length;
      const bCount = jobsData.filter(j => j.skills.includes(b)).length;
      return bCount - aCount;
    })[0];

    if (!topMissing) return null;

    const currentEligible = processedJobs.filter(j => j.pct >= 40).length;
    const nextAnalysis = processedJobs.map(j => ({
      ...j,
      nextPct: calculateMatch([...activeSkills, topMissing], j.skills).pct
    }));

    const potentialEligible = nextAnalysis.filter(j => j.nextPct >= 40).length;
    const improvedCount = nextAnalysis.filter(j => j.nextPct > j.pct).length;

    return {
      skill: topMissing,
      unlocked: potentialEligible - currentEligible,
      improved: improvedCount
    };
  }, [processedJobs, activeSkills]);

  const filteredJobs = processedJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && job.pct >= minMatch;
  });

  const toggleSimulate = (e: React.MouseEvent, skill: string) => {
    e.stopPropagation();
    setSimulatedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const getStatusClasses = (pct: number) => {
    if (pct >= 70) return { text: "text-emerald-400", bg: "bg-emerald-500", light: "bg-emerald-600/10", border: "border-emerald-500/30" };
    if (pct >= 40) return { text: "text-amber-400", bg: "bg-amber-500", light: "bg-amber-600/10", border: "border-amber-500/30" };
    return { text: "text-rose-400", bg: "bg-rose-500", light: "bg-rose-600/10", border: "border-rose-500/30" };
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto pb-24 animate-in fade-in duration-700">

      {isLoading ? (
        <div className="text-center p-10 text-slate-500 font-bold">Loading job matches...</div>
      ) : (
        <>
          {/* ── 1. GLOBAL DYNAMIC INSIGHT ───────────────────────────────── */}
          <div className="mb-12">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Job Intelligence</h1>

            {globalInsight && (globalInsight.unlocked > 0 || globalInsight.improved > 0) ? (
              <div className="mt-6 p-6 bg-slate-900 dark:bg-slate-800 text-white rounded-[2rem] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 group overflow-hidden relative border border-slate-700/50">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <TrendingUp className="w-24 h-24" />
                </div>
                <div className="flex items-center gap-5 relative z-10">
                  <div className="p-3.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-semibold leading-relaxed">
                    Adding <span className="text-blue-400 font-black">{globalInsight.skill}</span> unlocks <span className="text-emerald-400 font-black">{globalInsight.unlocked}</span> new roles and improves <span className="text-amber-400 font-black">{globalInsight.improved}</span> existing matches.
                  </p>
                </div>
                <button
                  onClick={() => toggleSimulate({ stopPropagation: () => { } } as any, globalInsight.skill)}
                  className="px-8 py-3.5 bg-blue-600 text-white text-xs font-black rounded-2xl hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/30 relative z-10"
                >
                  SIMULATE GLOBAL IMPACT
                </button>
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                Personalized alignment engine for your professional growth
              </p>
            )}
          </div>

          {/* ── 2. FILTERS BAR ─────────────────────────────────────────── */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 mb-10 flex flex-col md:flex-row gap-6">
            <div className="flex-1 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search roles or companies..."
                className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-5 bg-slate-50 dark:bg-slate-800/50 px-6 py-2 border border-slate-100 dark:border-slate-700 rounded-2xl">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Threshold</span>
              <select
                className="bg-transparent text-sm font-black text-blue-500 outline-none cursor-pointer"
                value={minMatch}
                onChange={e => setMinMatch(Number(e.target.value))}
              >
                <option value={0}>All Levels</option>
                <option value={30}>&gt; 30% Match</option>
                <option value={50}>&gt; 50% Match</option>
                <option value={75}>&gt; 75% Match</option>
              </select>
            </div>

            {simulatedSkills.length > 0 && (
              <button
                onClick={() => setSimulatedSkills([])}
                className="flex items-center gap-2 px-6 py-2 text-rose-500 hover:bg-rose-500/10 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all border border-rose-500/10"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Simulation
              </button>
            )}
          </div>

          {/* ── 3. RESULTS (OR SMART EMPTY STATE) ───────────────────────── */}
          {filteredJobs.length === 0 ? (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-12 text-center shadow-sm">
                <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">No roles match your threshold ({minMatch}%)</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">Focus on these high-potential matches you can unlock right now.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 opacity-75">
                {processedJobs.slice(0, 4).map(j => (
                  <div key={j.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-7 rounded-[2.5rem] shadow-sm hover:border-blue-500/30 transition-all group">
                    <div className="flex justify-between items-start mb-5">
                      <div>
                        <p className="font-black text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">{j.title}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{j.company}</p>
                      </div>
                      <span className="text-[10px] font-black px-2 py-1 bg-rose-500/10 text-rose-500 rounded-lg">{j.pct}%</span>
                    </div>
                    {j.nextSkill && (
                      <button
                        onClick={(e) => toggleSimulate(e, j.nextSkill!)}
                        className="w-full bg-blue-600/10 dark:bg-blue-500/10 p-3.5 rounded-2xl border border-blue-100 dark:border-blue-800/50 flex items-center justify-between group/btn hover:bg-blue-600 hover:text-white transition-all"
                      >
                        <p className="text-[10px] font-black uppercase tracking-tight">Missing: {j.nextSkill}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black">Reach {j.potentialPct}%</span>
                          <PlusCircle className="w-3 h-3 group-hover/btn:scale-125 transition-transform" />
                        </div>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredJobs.map((job, index) => {
                const isExpanded = expandedId === job.id;
                const status = getStatusClasses(job.pct);

                return (
                  <div
                    key={job.id}
                    className={clsx(
                      "bg-white dark:bg-slate-900 rounded-[2.5rem] border transition-all duration-500 group overflow-hidden relative cursor-pointer",
                      isExpanded ? "ring-2 ring-blue-500 shadow-2xl scale-[1.01]" : "border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-200 dark:hover:border-slate-700",
                      job.improvement > 0 && "ring-2 ring-emerald-500/40 bg-emerald-500/[0.02]"
                    )}
                    onClick={() => setExpandedId(isExpanded ? null : job.id)}
                  >
                    {/* Improvement Badge */}
                    {job.improvement > 0 && (
                      <div className="absolute top-5 right-12 z-10 bg-emerald-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-lg shadow-emerald-500/20 animate-in slide-in-from-right-4 duration-500 flex items-center gap-1.5">
                        <TrendingUp className="w-3 h-3" />
                        +{job.improvement}% improvement applied
                      </div>
                    )}

                    <div className="p-6 sm:p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                      {/* Identity */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-5 mb-4">
                          <div className="w-16 h-16 rounded-[1.25rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 group-hover:scale-105 transition-transform duration-500 shadow-sm">
                            <Building2 className="w-8 h-8 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 transition-colors truncate">
                              {job.title}
                            </h3>
                            <p className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-[0.2em] mt-1.5">{job.company}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                          <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" /> {job.location}
                          </div>
                          <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                            <Activity className="w-3.5 h-3.5 text-blue-500" /> Ranked #{index + 1}
                          </div>
                        </div>
                      </div>

                      {/* Alignment */}
                      <div className="w-full md:w-64 shrink-0 px-2 group/score relative">
                        <div className="flex justify-between items-end mb-3">
                          <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Alignment</span>
                            {job.pct === 0 && (
                              <p className="text-[9px] font-bold text-slate-500 animate-pulse">
                                Missing: {job.nextSkill} → Reach {job.potentialPct}%
                              </p>
                            )}
                          </div>
                          <span className={clsx("text-xl font-black transition-all duration-700", status.text)}>
                            {job.pct}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden shadow-inner border border-slate-200 dark:border-slate-700">
                          <div
                            className={clsx("h-full transition-all duration-1000 ease-out", status.bg, job.improvement > 0 && "brightness-125")}
                            style={{ width: `${job.pct}%` }}
                          />
                        </div>
                      </div>

                      {/* Action */}
                      <div className="shrink-0">
                        <button className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 group-hover:text-blue-500 transition-colors shadow-sm">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* ── EXPANDED BREAKDOWN ── */}
                    {isExpanded && (
                      <div className="px-8 pb-12 pt-4 bg-slate-50/50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/50 animate-in slide-in-from-top-4 duration-500 ease-out" onClick={e => e.stopPropagation()}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-6">

                          {/* Left: Why this job? */}
                          <div className="space-y-8">
                            <div>
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Why this job matches you</h4>
                              <div className={clsx(
                                "p-7 rounded-[2.5rem] border-2 relative overflow-hidden group/insight shadow-2xl transition-all duration-500",
                                status.light, status.border,
                                job.improvement > 0 && "ring-4 ring-emerald-500/10 border-emerald-500/40"
                              )}>
                                <div className="absolute top-0 right-0 p-5 opacity-20 group-hover:rotate-12 transition-transform duration-700">
                                  <Sparkles className="w-14 h-14 text-white" />
                                </div>
                                <p className="text-base font-semibold leading-relaxed relative z-10 text-gray-100">
                                  {job.insight}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-6 p-7 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                              <div className="p-3.5 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                                <Trophy className="w-7 h-7 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-base font-black text-slate-900 dark:text-white">Global Match Rank #{index + 1}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Out of {jobsData.length} industrial roles</p>
                              </div>
                            </div>
                          </div>

                          {/* Right: Skill Analysis */}
                          <div className="space-y-10">
                            <div>
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Skill Breakdown</h4>
                              <div className="space-y-8">
                                {/* Matched */}
                                <div>
                                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" /> Matched Skills
                                  </p>
                                  <div className="flex flex-wrap gap-2.5">
                                    {job.matched.map((s: string) => (
                                      <span key={s} className="px-5 py-2.5 bg-emerald-500/10 text-emerald-400 text-xs font-black rounded-xl border border-emerald-500/20 flex items-center gap-2 shadow-sm">
                                        <Check className="w-3 h-3" /> {s}
                                      </span>
                                    ))}
                                    {job.matched.length === 0 && <span className="text-xs text-slate-500 italic font-medium px-2">No verified skills detected yet.</span>}
                                  </div>
                                </div>

                                {/* Missing */}
                                <div>
                                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Zap className="w-4 h-4" /> Strategic Gaps (Interactive)
                                  </p>
                                  <div className="flex flex-wrap gap-3">
                                    {job.missing.map((s: string) => {
                                      const isSimulated = simulatedSkills.includes(s);
                                      const simPct = calculateMatch([...activeSkills, s], job.skills).pct;

                                      return (
                                        <button
                                          key={s}
                                          onClick={(e) => toggleSimulate(e, s)}
                                          className={clsx(
                                            "px-5 py-2.5 flex items-center gap-3 text-xs font-black rounded-xl border transition-all duration-300 group/skill cursor-pointer",
                                            isSimulated
                                              ? "bg-blue-600 text-white border-blue-500 shadow-xl shadow-blue-600/30 -translate-y-1"
                                              : "bg-rose-900/10 text-rose-300 border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/40"
                                          )}
                                        >
                                          {isSimulated ? <Check className="w-4 h-4" /> : <PlusCircle className="w-4 h-4 group-hover/skill:rotate-90 transition-transform" />}
                                          {isSimulated ? s : `+ Add ${s} → Improve to ${simPct}%`}
                                        </button>
                                      );
                                    })}
                                    {job.missing.length === 0 && (
                                      <div className="bg-emerald-500/10 text-emerald-400 px-6 py-3 rounded-2xl border border-emerald-500/20 flex items-center gap-3">
                                        <Sparkles className="w-5 h-5" />
                                        <span className="text-sm font-black">All requirements met! Ready to apply.</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>

                        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-8 p-8 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm relative group/footer">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-blue-600 border border-slate-100 dark:border-slate-700 shadow-inner">
                              <Briefcase className="w-7 h-7" />
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Application Readiness</p>
                              <p className="text-base font-bold text-slate-700 dark:text-slate-300">You are in the top <span className="text-blue-500 font-black">{(index + 1) * 10}%</span> of candidates based on alignment.</p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); router.push('/dashboard/student/applications'); }}
                            className="w-full sm:w-auto px-12 py-5 bg-blue-600 text-white font-black text-sm rounded-[1.5rem] hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-blue-600/30 flex items-center gap-3 group-hover/footer:ring-4 ring-blue-500/10"
                          >
                            SUBMIT APPLICATION
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-20 flex justify-center">
            <button
              onClick={() => router.push('/dashboard/student/skills')}
              className="flex items-center gap-4 px-10 py-5 bg-slate-900 dark:bg-slate-800 text-white font-black rounded-[2rem] hover:bg-slate-800 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-slate-900/20 group border border-slate-700/50"
            >
              REVISE SKILL INTELLIGENCE
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </>
      )}

    </div>
  );
}

