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
  TrendingUp,
  Loader2
} from "lucide-react";
import clsx from 'clsx';
import apiClient from "@/lib/axios";

function calculateMatch(userSkills: string[], jobSkills: string[]) {
  if (!jobSkills || !Array.isArray(jobSkills) || jobSkills.length === 0) {
    // If no specific skills required, default to a base match or 100% if student has any skills
    return { pct: userSkills.length > 0 ? 30 : 0, matched: [], missing: [] };
  }
  const matched = jobSkills.filter(s =>
    userSkills.some(u => u.toLowerCase().trim() === s.toLowerCase().trim())
  );
  const pct = Math.round((matched.length / jobSkills.length) * 100);
  const missing = jobSkills.filter(s =>
    !userSkills.some(u => u.toLowerCase().trim() === s.toLowerCase().trim())
  );
  return { pct, matched, missing };
}

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
        setJobsData(data);
      } catch (err) {
        console.error("Failed to fetch job matches:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const activeSkills = useMemo(() => [...user.skills, ...simulatedSkills], [user.skills, simulatedSkills]);

  const processedJobs = useMemo(() => {
    return jobsData.map(job => {
      // Use skills from backend if available, otherwise heuristic
      const jobSkills = job.skills && job.skills.length > 0 ? job.skills : [];
      const current = calculateMatch(activeSkills, jobSkills);
      const base = calculateMatch(user.skills, jobSkills);
      const improvement = current.pct - base.pct;

      const nextSkill = current.missing[0];
      const improvedPct = nextSkill ? calculateMatch([...activeSkills, nextSkill], jobSkills).pct : current.pct;

      let insight = "";
      if (jobSkills.length > 0) {
        insight = `You match ${current.matched.length}/${jobSkills.length} core skills. ${nextSkill ? `Mastering ${nextSkill} would boost your alignment to ${improvedPct}%.` : "Your expertise perfectly aligns with this role's requirements."}`;
      } else {
        insight = "This role is a strategic match based on your professional profile and experience.";
      }

      return {
        ...job,
        ...current,
        jobSkills,
        improvement,
        insight,
        nextSkill,
        potentialPct: improvedPct
      };
    }).sort((a, b) => b.pct - a.pct);
  }, [activeSkills, user.skills, jobsData]);

  const filteredJobs = processedJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && job.pct >= minMatch;
  });

  const getStatusClasses = (pct: number) => {
    if (pct >= 70) return { text: "text-emerald-500", bg: "bg-emerald-500", light: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800" };
    if (pct >= 40) return { text: "text-blue-500", bg: "bg-blue-500", light: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800" };
    return { text: "text-slate-500", bg: "bg-slate-400", light: "bg-slate-50 dark:bg-slate-800/50", border: "border-slate-200 dark:border-slate-700" };
  };

  const toggleSimulate = (e: React.MouseEvent, skill: string) => {
    e.stopPropagation();
    setSimulatedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleApply = async (jobId: number) => {
    try {
      await apiClient.post('/jobs/applications/', { job: jobId });
      alert("Application submitted successfully! ✅");
      router.push('/dashboard/student/applications');
    } catch (err: any) {
      const msg = err.response?.data?.[0] || err.response?.data?.job?.[0] || "Failed to submit application.";
      alert(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto pb-24 animate-in fade-in duration-700">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">Job Intelligence</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-500" />
          Real-time alignment engine tracking {jobsData.length} active opportunities
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 mb-10 flex flex-col md:flex-row gap-6">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Filter by role or company..."
            className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-5 bg-slate-50 dark:bg-slate-800/50 px-6 py-2 border border-slate-100 dark:border-slate-700 rounded-2xl">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Match Floor</span>
          <select
            className="bg-transparent text-sm font-black text-blue-600 outline-none cursor-pointer"
            value={minMatch}
            onChange={e => setMinMatch(Number(e.target.value))}
          >
            <option value={0}>All Matches</option>
            <option value={30}>30%+</option>
            <option value={50}>50%+</option>
            <option value={80}>80%+</option>
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {filteredJobs.length === 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-20 text-center shadow-sm">
            <AlertCircle className="w-16 h-16 text-slate-200 dark:text-slate-800 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Precision Matches</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 max-w-md mx-auto">
              We couldn't find roles matching your criteria. Try lowering the match floor or expanding your search.
            </p>
            <button 
              onClick={() => {setSearchQuery(""); setMinMatch(0);}}
              className="mt-8 px-8 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {filteredJobs.map((job, index) => {
          const isExpanded = expandedId === job.id;
          const status = getStatusClasses(job.pct);

          return (
            <div
              key={job.id}
              className={clsx(
                "bg-white dark:bg-slate-900 rounded-[2.5rem] border transition-all duration-500 group overflow-hidden relative",
                isExpanded ? "ring-2 ring-blue-500 shadow-2xl scale-[1.01]" : "border-slate-100 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-slate-600",
                job.improvement > 0 && "border-emerald-500/50 bg-emerald-500/[0.01]"
              )}
              onClick={() => setExpandedId(isExpanded ? null : job.id)}
            >
              <div className="p-6 sm:p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-5 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 border border-blue-100 dark:border-blue-800/50 shadow-sm group-hover:scale-110 transition-transform duration-500">
                      <Building2 className="w-8 h-8" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate uppercase italic">
                        {job.title}
                      </h3>
                      <p className="text-xs font-black text-blue-600 uppercase tracking-widest mt-1">{job.company}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-100 dark:border-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" /> {job.location}
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-100 dark:border-slate-700">
                      <Zap className="w-3.5 h-3.5 text-amber-500" /> {job.jobSkills.length || "Standard"} Requirements
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-64 shrink-0 px-2">
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alignment Index</span>
                    <span className={clsx("text-2xl font-black italic", status.text)}>
                      {job.pct}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden shadow-inner p-0.5">
                    <div
                      className={clsx("h-full rounded-full transition-all duration-1000 ease-out shadow-sm", status.bg)}
                      style={{ width: `${job.pct}%` }}
                    />
                  </div>
                </div>

                <button className="hidden md:block p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 group-hover:text-blue-600 transition-colors">
                  {isExpanded ? <ChevronUp /> : <ChevronDown />}
                </button>
              </div>

              {isExpanded && (
                <div className="px-8 pb-12 pt-6 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-4 duration-500" onClick={e => e.stopPropagation()}>
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="space-y-6">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Precision Insights</h4>
                         <div className={clsx("p-8 rounded-[2rem] border-2 relative overflow-hidden group/card shadow-xl transition-all", status.light, status.border)}>
                            <p className="text-lg font-bold leading-relaxed relative z-10 text-slate-800 dark:text-slate-200 italic">
                               "{job.insight}"
                            </p>
                            <Sparkles className="absolute top-0 right-0 w-24 h-24 text-blue-500/5 -rotate-12 group-hover:scale-150 transition-transform duration-1000" />
                         </div>
                         
                         <div className="flex items-center gap-6 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="p-4 bg-blue-100 dark:bg-blue-900/40 rounded-2xl">
                               <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                               <p className="text-sm font-black text-slate-900 dark:text-white uppercase italic">Market Relevance</p>
                               <p className="text-xs font-bold text-slate-500 mt-1">Based on {job.jobSkills.length} verified requirement clusters.</p>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-8">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Skill Intelligence Analysis</h4>
                         <div className="space-y-6">
                            <div>
                               <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4">Verified Strengths</p>
                               <div className="flex flex-wrap gap-2">
                                  {job.matched.map((s: string) => (
                                    <span key={s} className="px-4 py-2 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-xl border border-emerald-500/20 flex items-center gap-2">
                                       <Check className="w-3 h-3" /> {s}
                                    </span>
                                  ))}
                                  {job.matched.length === 0 && <span className="text-[10px] font-bold text-slate-400 italic">No direct matches found yet.</span>}
                               </div>
                            </div>

                            <div>
                               <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-4">Strategic Opportunities</p>
                               <div className="flex flex-wrap gap-3">
                                  {job.missing.map((s: string) => {
                                    const isSimulated = simulatedSkills.includes(s);
                                    return (
                                      <button
                                        key={s}
                                        onClick={(e) => toggleSimulate(e, s)}
                                        className={clsx(
                                          "px-5 py-3 flex items-center gap-3 text-[10px] font-black rounded-2xl border transition-all duration-300",
                                          isSimulated 
                                            ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/30 -translate-y-1" 
                                            : "bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700 hover:border-blue-500/30 hover:text-blue-500"
                                        )}
                                      >
                                        {isSimulated ? <Check className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                                        {s}
                                      </button>
                                    );
                                  })}
                                  {job.missing.length === 0 && (
                                    <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-500 text-xs font-black">
                                       Maximum alignment achieved!
                                    </div>
                                  )}
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm group/btn">
                      <div className="flex items-center gap-5">
                         <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-blue-600 shadow-inner">
                            <Briefcase className="w-6 h-6" />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 italic">Ready for high-impact application submission.</p>
                         </div>
                      </div>
                      <button 
                        onClick={(e) => {e.stopPropagation(); handleApply(job.id);}}
                        className="w-full sm:w-auto px-10 py-5 bg-blue-600 text-white font-black text-xs rounded-[1.5rem] hover:bg-blue-500 hover:scale-105 transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center gap-3"
                      >
                         EXECUTE APPLICATION
                         <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                      </button>
                   </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
