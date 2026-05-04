'use client';

import { useState, useMemo, useEffect } from "react";
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
  Clock,
  Trophy,
  Activity,
  Trash2,
  MoreVertical,
  Calendar,
  MousePointer2
} from "@/components/Icons";
import clsx from 'clsx';

import apiClient from "@/lib/axios";

export default function StudentApplicationsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Latest");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await apiClient.get('/applications/');
        const data = Array.isArray(res.data) ? res.data : [];
        const mapped = data.map((app: any) => ({
          id: app.id,
          jobTitle: `Job #${app.job}`,
          company: "Recruiter",
          location: "Remote",
          appliedDate: new Date(app.applied_at || app.created_at).toLocaleDateString(),
          status: app.status,
          matchScore: Math.floor(app.match_score || 0),
          matchedSkills: [],
          missingSkills: [],
          resumeScore: 80,
          probability: Math.floor(app.match_score || 0)
        }));
        setApplications(mapped);
      } catch (err) {
        console.error("Failed to fetch applications:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplications();
  }, []);

  // Stats Logic
  const stats = useMemo(() => ({
    total: applications.length,
    interviews: applications.filter(a => a.status === "Interview" || a.status === "SHORTLISTED").length,
    offers: applications.filter(a => a.status === "Offer" || a.status === "HIRED").length,
    rejected: applications.filter(a => a.status === "Rejected" || a.status === "REJECTED").length
  }), [applications]);

  // Filter & Sort Logic
  const filteredApps = useMemo(() => {
    let result = applications.filter(app => {
      const matchesSearch = app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            app.company.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    if (sortBy === "Match") result.sort((a, b) => b.matchScore - a.matchScore);
    // Add more sort logic if needed
    
    return result;
  }, [applications, searchQuery, statusFilter, sortBy]);

  const getStatusStyle = (status: string) => {
    switch(status) {
      case "Offer": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "Interview": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "Rejected": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default: return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  const getMatchClasses = (score: number) => {
    if (score >= 70) return { text: "text-emerald-500", bg: "bg-emerald-500" };
    if (score >= 40) return { text: "text-amber-500", bg: "bg-amber-400" };
    return { text: "text-rose-500", bg: "bg-rose-500" };
  };

  const timelineSteps = ["Applied", "Shortlisted", "Interview", "Offer"];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto pb-24 animate-in fade-in duration-700">
      
      {isLoading ? (
        <div className="text-center p-10 text-slate-500 font-bold">Loading applications...</div>
      ) : (
        <>
          {/* ── 1. GLOBAL STATS ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Applications", value: stats.total, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Interviews", value: stats.interviews, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Offers", value: stats.offers, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Rejected", value: stats.rejected, color: "text-rose-600", bg: "bg-rose-50" }
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={clsx("text-3xl font-black", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── 2. SMART INSIGHT BANNER ─────────────────────────────────── */}
      {stats.interviews > 0 && (
        <div className="mb-10 p-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
           <div className="absolute top-0 right-0 p-4 opacity-5">
              <Sparkles className="w-20 h-20" />
           </div>
           <div className="flex items-center gap-5 relative z-10">
              <div className="p-3 bg-blue-600 rounded-2xl">
                 <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-black">You have {stats.interviews} interviews scheduled!</p>
                <p className="text-[10px] font-bold text-blue-400 dark:text-blue-600 uppercase tracking-widest mt-0.5">Focus on improving System Design & Communication</p>
              </div>
           </div>
           <button 
             onClick={() => router.push('/dashboard/student/prep-guide')}
             className="px-8 py-3 bg-blue-600 text-white text-xs font-black rounded-2xl hover:scale-105 transition-all shadow-xl shadow-blue-600/20 whitespace-nowrap"
           >
             VIEW PREP GUIDE
           </button>
        </div>
      )}

      {/* ── 3. FILTERS BAR ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 mb-10 flex flex-col lg:flex-row gap-6">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text"
            placeholder="Search company or job..."
            className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-6 py-2 border border-slate-100 dark:border-slate-700 rounded-2xl">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              className="bg-transparent text-sm font-black text-blue-600 outline-none cursor-pointer"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-6 py-2 border border-slate-100 dark:border-slate-700 rounded-2xl">
            <Activity className="w-4 h-4 text-slate-400" />
            <select 
              className="bg-transparent text-sm font-black text-blue-600 outline-none cursor-pointer"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="Latest">Latest</option>
              <option value="Match">Highest Match</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── 4. APPLICATIONS LIST ─────────────────────────────────────── */}
      {filteredApps.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-16 text-center shadow-sm">
          <Briefcase className="w-16 h-16 text-slate-200 dark:text-slate-800 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No applications found</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium mb-8">
            You haven't applied to any roles yet. Start with roles where you have a 40%+ match to increase your success probability.
          </p>
          <button 
            onClick={() => router.push('/dashboard/student/job-matches')}
            className="px-10 py-5 bg-blue-600 text-white font-black rounded-[1.5rem] hover:scale-105 transition-all shadow-xl shadow-blue-600/30 flex items-center gap-2 mx-auto"
          >
            Explore Job Matches <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredApps.map((app) => {
            const isExpanded = expandedId === app.id;
            const matchStyles = getMatchClasses(app.matchScore);
            const statusStyle = getStatusStyle(app.status);
            const currentStepIdx = timelineSteps.indexOf(app.status === "Rejected" ? "Applied" : app.status);

            return (
              <div 
                key={app.id} 
                className={clsx(
                  "bg-white dark:bg-slate-900 rounded-[2.5rem] border transition-all duration-500 group overflow-hidden",
                  isExpanded ? "ring-2 ring-blue-500 shadow-2xl scale-[1.01]" : "border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-200 dark:hover:border-slate-700"
                )}
                onClick={() => setExpandedId(isExpanded ? null : app.id)}
              >
                {/* Compact Header */}
                <div className="p-6 sm:p-8 flex flex-col lg:flex-row gap-8 items-start lg:items-center cursor-pointer">
                  
                  {/* Identity */}
                  <div className="flex-1 w-full min-w-0">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-sm group-hover:scale-105 transition-transform">
                        <Building2 className="w-7 h-7 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 transition-colors truncate">
                          {app.jobTitle}
                        </h3>
                        <p className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest mt-1">{app.company}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-[10px] font-black text-slate-400">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" /> {app.location}
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <Clock className="w-3.5 h-3.5 text-blue-500" /> Applied {app.appliedDate}
                      </div>
                    </div>
                  </div>

                  {/* Match Progress */}
                  <div className="w-full lg:w-48 shrink-0 group/score">
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Job Match</span>
                       <span className={clsx("text-sm font-black", matchStyles.text)}>{app.matchScore}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden shadow-inner">
                       <div className={clsx("h-full transition-all duration-1000", matchStyles.bg)} style={{ width: `${app.matchScore}%` }} />
                    </div>
                  </div>

                  {/* Status & Probability */}
                  <div className="w-full lg:w-48 shrink-0">
                     <div className="flex items-center justify-between lg:justify-end gap-3">
                        <div className="lg:text-right">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Success Prop.</p>
                           <p className="text-sm font-black text-slate-900 dark:text-white">{app.probability}% Chance</p>
                        </div>
                        <div className={clsx("px-4 py-2 rounded-xl text-xs font-black border uppercase tracking-widest", statusStyle)}>
                          {app.status}
                        </div>
                     </div>
                  </div>

                  <div className="shrink-0 ml-auto lg:ml-0">
                    <button className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-blue-500">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-8 pb-10 pt-6 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-4 duration-500" onClick={e => e.stopPropagation()}>
                    
                    {/* Status Timeline */}
                    <div className="mb-10">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Application Journey</h4>
                       <div className="relative flex justify-between items-center max-w-2xl mx-auto px-4">
                          <div className="absolute left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 top-1/2 -translate-y-1/2 z-0" />
                          <div className="absolute left-0 h-1 bg-blue-600 top-1/2 -translate-y-1/2 z-0 transition-all duration-1000" style={{ width: `${(currentStepIdx / (timelineSteps.length - 1)) * 100}%` }} />
                          
                          {timelineSteps.map((step, idx) => {
                            const isPast = idx <= currentStepIdx;
                            const isCurrent = idx === currentStepIdx;
                            return (
                              <div key={step} className="relative z-10 flex flex-col items-center">
                                <div className={clsx(
                                  "w-8 h-8 rounded-full flex items-center justify-center border-4 transition-all duration-700",
                                  isPast ? "bg-blue-600 border-blue-100 dark:border-slate-900 text-white" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-300"
                                )}>
                                  {isPast ? <Check className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                                </div>
                                <span className={clsx("text-[9px] font-black uppercase mt-2 tracking-widest", isCurrent ? "text-blue-600" : "text-slate-400")}>{step}</span>
                              </div>
                            );
                          })}
                       </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                       {/* Explainability */}
                       <div className="space-y-6">
                          <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Strategic Review</h4>
                            <div className="p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 relative overflow-hidden group/insight">
                               <div className="absolute top-0 right-0 p-4 opacity-5">
                                 <Sparkles className="w-12 h-12" />
                               </div>
                               <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed relative z-10">
                                 {app.status === "Rejected" 
                                  ? `You were highly competitive for this role but missed ${app.missingSkills.length} core competencies. Focusing on ${app.missingSkills[0]} will increase future success rates.`
                                  : `You match ${app.matchedSkills.length} critical skills. Your profile has strong frontend alignment, resulting in a ${app.probability}% success probability.`}
                               </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                             <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl">
                               <Target className="w-6 h-6 text-blue-600" />
                             </div>
                             <div>
                               <p className="text-sm font-black text-slate-900 dark:text-white">Resume IQ: {app.resumeScore}%</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Optimized for ATS Screening</p>
                             </div>
                          </div>
                       </div>

                       {/* Skill Breakdown */}
                       <div className="space-y-6">
                          <div>
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" /> Matched Advantage
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {app.matchedSkills.map(s => (
                                <span key={s} className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 text-xs font-black rounded-xl border border-emerald-100 dark:border-emerald-800">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>

                          {app.missingSkills.length > 0 && (
                            <div>
                              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Zap className="w-4 h-4" /> Recommendation for Growth
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {app.missingSkills.map(s => (
                                  <span key={s} className="px-4 py-2 bg-rose-50 dark:bg-rose-900/10 text-rose-700 dark:text-rose-400 text-xs font-black rounded-xl border border-rose-100 dark:border-rose-800">
                                    Improve {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                       </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-10 flex flex-wrap items-center justify-between gap-6 p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm group/footer">
                       <div className="flex items-center gap-4">
                          <button className="px-8 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-xs rounded-2xl hover:bg-slate-200 transition-colors">
                            VIEW ORIGINAL JOB
                          </button>
                          <div className="relative group/menu">
                            <button className="p-3.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl hover:text-blue-600 transition-colors">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                         <span className="text-xs font-bold text-slate-400 mr-2">Update status:</span>
                         <div className="flex gap-2">
                            {["Interview", "Offer", "Rejected"].filter(s => s !== app.status).map(s => (
                              <button key={s} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[10px] font-black text-slate-500 hover:text-blue-600 rounded-xl transition-colors uppercase tracking-widest">
                                {s}
                              </button>
                            ))}
                         </div>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Explore CTA */}
      <div className="mt-20 flex flex-col items-center gap-6">
         <p className="text-slate-500 font-bold text-sm">Want to find more opportunities?</p>
         <button 
           onClick={() => router.push('/dashboard/student/job-matches')}
           className="px-12 py-5 bg-slate-900 dark:bg-slate-800 text-white font-black rounded-[2rem] hover:scale-105 transition-all shadow-2xl shadow-slate-900/20 group flex items-center gap-4"
         >
           Refine My Intelligence
           <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
         </button>
      </div>
        </>
      )}

    </div>
  );
}

