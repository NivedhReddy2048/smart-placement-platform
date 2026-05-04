'use client';

import { useState, useRef, useEffect } from "react";
import api from "@/lib/axios";
import { 
  UploadCloud, FileText, CheckCircle, AlertCircle, X, Target, 
  Sparkles, Briefcase, RefreshCw, Star, Layers, Activity, LayoutList, PenTool
} from "lucide-react";

interface MatchResult {
  match_score: number;
  ats_score: number;
  ats_breakdown: {
    formatting: number;
    keyword_optimization: number;
    experience_clarity: number;
    projects_quality: number;
    readability: number;
  };
  matched_skills: string[];
  missing_skills: string[];
  strengths_for_role: string[];
  gaps: string[];
  recommendations: string[];
  resume_improvements: string[];
  keyword_match_percentage: number;
  final_verdict: string;
}

export default function JobMatcherPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<MatchResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Save/load last job description UX
    const saved = localStorage.getItem("last_job_description");
    if (saved) {
      setJobDescription(saved);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      setError("Please upload a valid PDF file.");
      setFile(null);
      return;
    }
    setError("");
    setFile(selectedFile);
    setResult(null);
  };

  const clearFile = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) {
       fileInputRef.current.value = '';
    }
  };

  const handleCompare = async () => {
    if (!file) {
      setError("Please select your resume.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please paste a job description.");
      return;
    }

    setLoading(true);
    setError("");
    localStorage.setItem("last_job_description", jobDescription);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("job_description", jobDescription);

      const res = await api.post("/resume/match-job/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(res.data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to process the comparison. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getVerdictColor = (verdict: string) => {
    const v = verdict.toLowerCase();
    if (v.includes("good") || v.includes("excellent") || v.includes("strong")) return "text-green-700 bg-green-50 border-green-200";
    if (v.includes("moderate") || v.includes("fair")) return "text-amber-700 bg-amber-50 border-amber-200";
    return "text-rose-700 bg-rose-50 border-rose-200";
  };

  const circleCircumference = 439.8; 
  const strokeOffset = result ? circleCircumference - (circleCircumference * result.match_score) / 100 : circleCircumference;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto pb-24">
      
      {/* Header */}
      <div className="mb-8 relative flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">AI Job Matcher</h2>
          <p className="text-gray-500 mt-2 font-medium">Compare your resume against specific job descriptions to uncover gaps and strengths instantly.</p>
        </div>
        {result && (
          <button onClick={() => setResult(null)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold shadow-sm hover:bg-gray-50 flex items-center transition-all">
             <RefreshCw className="w-4 h-4 mr-2" /> Start New Comparison
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-8 flex items-center font-medium shadow-sm animate-in fade-in">
           <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
           {error}
        </div>
      )}

      {/* Input Section */}
      {!result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 transition-all">
           
           {/* Upload Resume Left */}
           <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
             <h3 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center"><FileText className="w-5 h-5 mr-2 text-blue-500"/> 1. Upload Resume</h3>
             <div 
               onDragOver={handleDragOver}
               onDragLeave={handleDragLeave}
               onDrop={handleDrop}
               onClick={() => !loading && fileInputRef.current?.click()}
               className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex-1 flex flex-col justify-center items-center
                 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
                 ${loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
             >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="application/pdf" 
                  className="hidden" 
                />
                
                {file ? (
                   <div className="flex flex-col items-center animate-in zoom-in-95 duration-200">
                      <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                         <FileText className="w-6 h-6" />
                      </div>
                      <p className="text-base font-bold text-gray-900 mb-1 line-clamp-1">{file.name}</p>
                      <p className="text-sm text-gray-500 font-medium font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      
                      {!loading && (
                         <button 
                           onClick={(e) => { e.stopPropagation(); clearFile(); }}
                           className="mt-4 px-3 py-1 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center"
                         >
                            <X className="w-4 h-4 mr-1" /> Remove
                         </button>
                      )}
                   </div>
                ) : (
                   <div className="flex flex-col items-center">
                      <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3">
                         <UploadCloud className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-gray-900">Click or drag & drop PDF</h4>
                   </div>
                )}
             </div>
           </div>

           {/* Paste Description Right */}
           <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
             <h3 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center"><Briefcase className="w-5 h-5 mr-2 text-indigo-500"/> 2. Job Description</h3>
             <textarea 
               className="w-full flex-1 min-h-[250px] p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y text-gray-700 text-sm font-medium"
               placeholder="Paste the target job description here..."
               value={jobDescription}
               onChange={e => setJobDescription(e.target.value)}
               disabled={loading}
             />
           </div>

           {/* Action Panel */}
           <div className="max-w-xl mx-auto col-span-1 lg:col-span-2 flex justify-center mt-2">
              <button
                 onClick={handleCompare}
                 disabled={!file || !jobDescription.trim() || loading}
                 className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center transition-all shadow-md hover:shadow-lg w-full justify-center"
              >
                 {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Comparing with job...
                    </>
                 ) : (
                    <>
                       <Sparkles className="w-5 h-5 mr-2" />
                       Analyze Match Potential
                    </>
                 )}
              </button>
           </div>
        </div>
      )}

      {/* Analysis Result Section */}
      {result && !loading && (
         <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-500 fade-in">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               
               {/* SCORE OVERVIEW */}
               <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute top-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">Match Score</h4>
                  
                  <div className="relative w-44 h-44 flex items-center justify-center bg-gray-50 rounded-full mb-6 shadow-inner">
                     <svg className="w-full h-full transform -rotate-90 absolute">
                       <circle cx="88" cy="88" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-gray-200" />
                       <circle 
                         cx="88" cy="88" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" 
                         strokeDasharray={439.8} 
                         strokeDashoffset={strokeOffset}
                         className={`transition-all duration-1000 ease-out ${result.match_score >= 80 ? 'text-green-500' : result.match_score >= 60 ? 'text-blue-500' : 'text-rose-500'}`}
                       />
                     </svg>
                     <div className="text-center absolute flex flex-col items-center justify-center">
                        <span className="text-5xl font-black text-gray-900">{result.match_score}%</span>
                     </div>
                  </div>

                  <div className={`mt-2 w-full border rounded-xl p-3 flex flex-col items-center ${getVerdictColor(result.final_verdict)}`}>
                     <span className="text-xs font-bold uppercase tracking-wider mb-0.5 opacity-80">Final Verdict</span>
                     <span className="font-extrabold text-center flex items-center text-lg">{result.final_verdict}</span>
                  </div>
               </div>

               {/* KEYWORDS AND SKILLS */}
               <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
                  
                  <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-green-100 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-10 text-green-600"><CheckCircle className="w-20 h-20"/></div>
                     <h4 className="text-sm font-extrabold text-green-700 uppercase tracking-wider mb-4 flex items-center relative z-10"><CheckCircle className="w-4 h-4 mr-2" /> Matched Skills</h4>
                     
                     <div className="flex flex-wrap gap-2 relative z-10">
                        {result.matched_skills.length > 0 ? result.matched_skills.map((skill, idx) => (
                           <span key={idx} className="px-3 py-1 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-bold capitalize">
                              {skill}
                           </span>
                        )) : <p className="text-sm font-medium text-gray-500">No overlapping skills found</p>}
                     </div>
                  </div>

                  <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-rose-100 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-10 text-rose-600"><AlertCircle className="w-20 h-20"/></div>
                     <h4 className="text-sm font-extrabold text-rose-700 uppercase tracking-wider mb-4 flex items-center relative z-10"><AlertCircle className="w-4 h-4 mr-2" /> Missing Dependencies</h4>
                     
                     <div className="flex flex-wrap gap-2 relative z-10">
                        {result.missing_skills.length > 0 ? result.missing_skills.map((skill, idx) => (
                           <span key={idx} className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm font-bold capitalize">
                              {skill}
                           </span>
                        )) : <p className="text-sm font-medium text-gray-500">You perfectly match all identified baseline dependencies!</p>}
                     </div>
                  </div>

                  <div className="sm:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between shadow-sm">
                        <div className="flex items-center">
                           <Activity className="w-8 h-8 text-indigo-500 mr-4 flex-shrink-0" />
                           <div>
                              <h4 className="text-lg font-bold text-indigo-900 leading-tight">Keyword Density</h4>
                              <p className="text-indigo-700 font-medium text-xs mt-1">Semantic overlap matched</p>
                           </div>
                        </div>
                        <div className="mt-4 sm:mt-0 font-black text-3xl text-indigo-700">{result.keyword_match_percentage}%</div>
                     </div>
                     
                     <div className="bg-purple-50 border border-purple-100 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-5 text-purple-600"><LayoutList className="w-16 h-16"/></div>
                        <div className="flex items-center relative z-10">
                           <LayoutList className="w-8 h-8 text-purple-500 mr-4 flex-shrink-0" />
                           <div>
                              <h4 className="text-lg font-bold text-purple-900 leading-tight">ATS Quality Score</h4>
                              <p className="text-purple-700 font-medium text-xs mt-1">Formatting, clarity, metrics</p>
                           </div>
                        </div>
                        <div className="mt-4 sm:mt-0 font-black text-3xl text-purple-700 relative z-10">{result.ats_score}%</div>
                     </div>
                  </div>

                  {/* ATS Breakdown Bars */}
                  {result.ats_breakdown && (
                     <div className="sm:col-span-2 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 mt-2">
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-5">ATS Deep Breakdown</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                           {Object.entries(result.ats_breakdown).map(([key, val]) => (
                              <div key={key}>
                                 <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-sm font-bold text-gray-700 capitalize">{key.replace('_', ' ')}</span>
                                    <span className="text-xs font-bold text-gray-500">{val}%</span>
                                 </div>
                                 <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <div className={`h-2 rounded-full transition-all duration-1000 ${val >= 80 ? 'bg-green-500' : val >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${val}%` }}></div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
               
               {/* Strengths & Gaps Panels */}
               <div className="space-y-6">
                  <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                     <h4 className="text-lg font-extrabold text-gray-900 mb-5 flex items-center"><Star className="w-5 h-5 mr-2 text-amber-500 fill-amber-500" /> Confirmed Strengths For Role</h4>
                     <ul className="space-y-4">
                        {result.strengths_for_role.length > 0 ? result.strengths_for_role.map((item, idx) => (
                           <li key={idx} className="flex items-start">
                              <span className="flex-shrink-0 w-2 h-2 mt-2 bg-amber-500 rounded-full mr-3"></span>
                              <span className="text-gray-700 font-semibold">{item}</span>
                           </li>
                        )) : <p className="text-sm text-gray-500 font-medium">None clearly identified specifically for this mapping.</p>}
                     </ul>
                  </div>

                  <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                     <h4 className="text-lg font-extrabold text-gray-900 mb-5 flex items-center"><Layers className="w-5 h-5 mr-2 text-rose-500" /> Structural Gaps</h4>
                     <ul className="space-y-4">
                        {result.gaps.length > 0 ? result.gaps.map((item, idx) => (
                           <li key={idx} className="flex items-start">
                              <span className="flex-shrink-0 w-2 h-2 mt-2 bg-rose-500 rounded-full mr-3"></span>
                              <span className="text-gray-700 font-medium">{item}</span>
                           </li>
                        )) : <p className="text-sm text-gray-500 font-medium">No major structural gaps visually decoupled.</p>}
                     </ul>
                  </div>
               </div>

               {/* Recommendations & Edits Vertical Stack */}
               <div className="flex flex-col gap-6">
                  {/* Recommendations */}
                  <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-indigo-100 relative overflow-hidden flex-1">
                     <div className="absolute -right-6 -bottom-6 w-56 h-56 bg-indigo-50 rounded-full blur-3xl opacity-60"></div>
                     <h4 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center relative z-10">
                        <Target className="w-5 h-5 mr-3 text-indigo-600" /> Tactical Match Improvements
                     </h4>
                     
                     {result.recommendations.length > 0 ? (
                        <div className="space-y-4 relative z-10">
                          {result.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start bg-indigo-50/50 border border-indigo-50 p-4 rounded-2xl">
                               <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 font-black text-sm mr-4 shadow-sm">
                                  {index + 1}
                               </span>
                               <span className="text-gray-800 font-semibold leading-relaxed mt-1 text-sm">{rec}</span>
                            </div>
                          ))}
                        </div>
                     ) : (
                        <p className="text-gray-500 font-medium relative z-10 bg-green-50 p-4 rounded-xl border border-green-100 text-green-700">
                           No immediate alterations suggested. Your formatting overlaps perfectly.
                        </p>
                     )}
                  </div>

                  {/* Concrete ATS Resume Improvements */}
                  {result.resume_improvements && result.resume_improvements.length > 0 && (
                     <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-purple-100 relative overflow-hidden flex-1">
                        <h4 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center relative z-10">
                           <PenTool className="w-5 h-5 mr-3 text-purple-600" /> Concrete Resume PDF Edits
                        </h4>
                        
                        <div className="space-y-4 relative z-10">
                          {result.resume_improvements.map((rec, index) => (
                            <div key={index} className="flex items-start bg-purple-50/50 border border-purple-50 p-4 rounded-2xl">
                               <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-purple-100 text-purple-700 font-black text-sm mr-4 shadow-sm">
                                  {index + 1}
                               </span>
                               <span className="text-gray-800 font-semibold leading-relaxed mt-1 text-sm">{rec}</span>
                            </div>
                          ))}
                        </div>
                     </div>
                  )}
               </div>

            </div>
         </div>
      )}
    </div>
  );
}
