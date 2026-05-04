'use client';

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ArrowRight,
  BookOpen, 
  CheckCircle2, 
  MessageSquare, 
  Code2, 
  Layout, 
  Sparkles, 
  Trophy, 
  Zap, 
  Target,
  Circle,
  AlertCircle
} from "@/components/Icons";
import clsx from 'clsx';

// ── 1. MOCK APPLICATIONS DATA (Sync with Dashboard) ─────────────────────────

const MOCK_APPLICATIONS = [
  {
    role: "Junior Web Developer",
    company: "Zomato",
    status: "Interview",
    matchScore: 75,
    successProbability: 78,
  },
  {
    role: "Frontend Developer",
    company: "Optum",
    status: "Applied",
    matchScore: 60,
  },
  {
    role: "Backend Specialist",
    company: "Infosys",
    status: "Applied",
    matchScore: 35,
  }
];

// ────────────────────────────────────────────────────────────────────────────

export default function PrepGuidePage() {
  const router = useRouter();
  
  // ── 2. STATE & PROGRESS ───────────────────────────────────────────────────
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);

  // ── 3. INTELLIGENCE ENGINE ───────────────────────────────────────────────
  const intelligence = useMemo(() => {
    const hasInterview = MOCK_APPLICATIONS.some(app => app.status === "Interview");
    const lowMatchJobs = MOCK_APPLICATIONS.filter(app => app.matchScore < 50).length;
    const currentFocusRole = MOCK_APPLICATIONS.find(app => app.status === "Interview") || MOCK_APPLICATIONS[0];
    
    let focusAreas: string[] = [];
    if (hasInterview) {
      focusAreas = ["System Design", "Communication"];
    } else if (lowMatchJobs > 1) {
      focusAreas = ["DSA", "Core Skills"];
    } else {
      focusAreas = ["DSA", "System Design"];
    }

    const recommendations: string[] = [];
    if (hasInterview) recommendations.push("Practice explaining your technical architecture clearly.");
    if (lowMatchJobs > 1) recommendations.push("Review fundamental DSA patterns for low-match roles.");
    recommendations.push(`Deep dive into ${currentFocusRole.company}'s recent tech blog.`);

    return { hasInterview, lowMatchJobs, currentFocusRole, focusAreas, recommendations };
  }, []);

  const sections = [
    {
      id: "DSA",
      title: "Data Structures & Algorithms",
      icon: <Code2 className="w-6 h-6 text-blue-500" />,
      priority: intelligence.focusAreas.includes("DSA") ? "High" : "Medium",
      topics: ["Arrays & Hashing", "Two Pointers", "Sliding Window", "Trees & Graphs"]
    },
    {
      id: "System Design",
      title: "System Design",
      icon: <Layout className="w-6 h-6 text-emerald-500" />,
      priority: intelligence.focusAreas.includes("System Design") ? "High" : "Medium",
      topics: ["Scalability", "Load Balancing", "Caching Strategies", "Database Sharding"]
    },
    {
      id: "Communication",
      title: "Communication & Soft Skills",
      icon: <MessageSquare className="w-6 h-6 text-amber-500" />,
      priority: intelligence.focusAreas.includes("Communication") ? "High" : "Medium",
      topics: ["STAR Method", "Technical Storytelling", "Conflict Resolution", "Culture Fit"]
    }
  ];

  const totalTopics = sections.reduce((acc, s) => acc + s.topics.length, 0);
  const progress = Math.round((completedTopics.length / totalTopics) * 100);

  const toggleTopic = (topic: string) => {
    setCompletedTopics(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto pb-24 animate-in fade-in duration-700">
      
      {/* Navigation & Status */}
      <div className="mb-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold text-sm self-start"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Intelligence
        </button>
        
        <div className="w-full sm:w-72">
           <div className="flex justify-between items-end mb-2">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prep Progress</span>
             <span className="text-sm font-black text-blue-600">{completedTopics.length}/{totalTopics} Nodes</span>
           </div>
           <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
             <div 
               className="h-full bg-blue-600 transition-all duration-1000 ease-out" 
               style={{ width: `${progress}%` }} 
             />
           </div>
        </div>
      </div>

      {/* Dynamic Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
           <div className="px-3 py-1 bg-rose-500/10 text-rose-500 text-[10px] font-black rounded-lg border border-rose-500/20 uppercase tracking-widest">
             {intelligence.hasInterview ? "🔥 Interview Focused" : "⚡ Skill Building"}
           </div>
           {intelligence.hasInterview && (
             <span className="text-xs font-bold text-slate-400">
               Next: {intelligence.currentFocusRole.role} at {intelligence.currentFocusRole.company}
             </span>
           )}
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Preparing for: {intelligence.currentFocusRole.role}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-3 max-w-3xl leading-relaxed">
          You have <span className="text-blue-600 font-black">{MOCK_APPLICATIONS.filter(a => a.status === "Interview").length} active interview(s)</span>. 
          Our intelligence engine recommends focusing on <span className="text-slate-900 dark:text-white font-black underline decoration-blue-500 decoration-2 underline-offset-4">{intelligence.focusAreas.join(" & ")}</span> to maximize your success probability.
        </p>
      </div>

      {/* Smart Recommendations */}
      <div className="mb-12 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
         <div className="absolute top-0 right-0 p-6 opacity-5">
           <Zap className="w-20 h-20" />
         </div>
         <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">AI Strategic Recommendations</h2>
         <div className="space-y-4">
           {intelligence.recommendations.map((rec, i) => (
             <div key={i} className="flex items-start gap-4">
               <div className="mt-1 p-1 bg-emerald-500/10 rounded-lg">
                 <Target className="w-4 h-4 text-emerald-500" />
               </div>
               <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{rec}</p>
             </div>
           ))}
         </div>
      </div>

      {/* Dynamic Sections */}
      <div className="grid gap-8">
        {sections.map((section) => {
          const isFocused = intelligence.focusAreas.includes(section.id);
          const isHighPriority = section.priority === "High";

          return (
            <div 
              key={section.id} 
              className={clsx(
                "p-8 rounded-[2.5rem] border transition-all duration-500 group relative",
                isFocused 
                  ? "bg-white dark:bg-slate-900 border-blue-100 dark:border-blue-900 shadow-2xl scale-[1.01]" 
                  : "bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-60 hover:opacity-100"
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className={clsx(
                    "p-3 rounded-2xl transition-transform group-hover:scale-110",
                    isFocused ? "bg-blue-50 dark:bg-blue-900/30" : "bg-white dark:bg-slate-800"
                  )}>
                    {section.icon}
                  </div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">{section.title}</h2>
                </div>
                
                <div className={clsx(
                  "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                  isHighPriority 
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20 animate-pulse" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                )}>
                  {isHighPriority ? <Sparkles className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                  {section.priority} Priority
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {section.topics.map((topic) => {
                  const isDone = completedTopics.includes(topic);
                  return (
                    <button 
                      key={topic} 
                      onClick={() => toggleTopic(topic)}
                      className={clsx(
                        "flex items-center justify-between p-5 rounded-2xl border transition-all text-left",
                        isDone 
                          ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800" 
                          : "bg-white dark:bg-slate-800 border-slate-50 dark:border-slate-700 hover:border-blue-300"
                      )}
                    >
                      <span className={clsx(
                        "text-sm font-bold transition-colors",
                        isDone ? "text-emerald-700 dark:text-emerald-400" : "text-slate-600 dark:text-slate-400"
                      )}>
                        {topic}
                      </span>
                      <div className={clsx(
                        "w-6 h-6 rounded-lg flex items-center justify-center transition-all",
                        isDone ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-300"
                      )}>
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mock Interview CTA */}
      <div className="mt-16 bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <Trophy className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <h3 className="text-3xl font-black mb-4 tracking-tight">Ready for {intelligence.currentFocusRole.company}?</h3>
          <p className="text-slate-400 font-medium mb-8 max-w-lg leading-relaxed">
            Our AI recruiter is calibrated for <span className="text-white font-bold">{intelligence.currentFocusRole.role}</span> interview patterns. Practice now to boost your probability to <span className="text-blue-400 font-black">90%+</span>.
          </p>
          <button 
            onClick={() => router.push('/dashboard/student/mock-interview')}
            className="px-10 py-5 bg-blue-600 text-white font-black rounded-[1.5rem] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/20 flex items-center gap-3"
          >
            START MOCK INTERVIEW
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

    </div>
  );
}

