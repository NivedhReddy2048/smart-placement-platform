import os

files = {
    # Student Dashboard
    "src/app/dashboard/student/page.tsx": """'use client';
import { useAuth } from '@/context/AuthContext';
import { Briefcase, FileText, CheckCircle, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function StudentDashboard() {
  const { user } = useAuth();
  
  // Dummy Data for visual impression
  const profileComplete = 85;
  const mockSkillData = [
    { name: 'React', score: 90 },
    { name: 'Python', score: 80 },
    { name: 'Django', score: 60 },
    { name: 'Algorithms', score: 50 },
  ];

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex justify-between items-center bg-neutral-800 p-6 rounded-2xl shadow-xl shadow-black/50 border border-neutral-700">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              Welcome back, {user?.username || 'Student'}!
            </h1>
            <p className="text-neutral-400 mt-2">Your skill readiness is progressing beautifully.</p>
          </div>
          <div className="w-20 h-20 rounded-full border-4 border-indigo-500 flex items-center justify-center bg-neutral-800 bg-opacity-50">
            <span className="text-xl font-bold text-indigo-400">{profileComplete}%</span>
          </div>
        </header>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-neutral-800 p-6 rounded-2xl border border-neutral-700 flex flex-col justify-center items-center hover:scale-105 transition-transform cursor-pointer">
            <CheckCircle className="text-emerald-400 w-10 h-10 mb-3" />
            <h3 className="text-neutral-400 text-sm uppercase tracking-widest font-semibold">Matched Roles</h3>
            <p className="text-3xl font-bold mt-2">12</p>
          </div>
          <div className="bg-neutral-800 p-6 rounded-2xl border border-neutral-700 flex flex-col justify-center items-center hover:scale-105 transition-transform cursor-pointer">
            <FileText className="text-blue-400 w-10 h-10 mb-3" />
            <h3 className="text-neutral-400 text-sm uppercase tracking-widest font-semibold">Resumes Parsed</h3>
            <p className="text-3xl font-bold mt-2">3</p>
          </div>
          <div className="bg-neutral-800 p-6 rounded-2xl border border-neutral-700 flex flex-col justify-center items-center hover:scale-105 transition-transform cursor-pointer">
            <Briefcase className="text-purple-400 w-10 h-10 mb-3" />
            <h3 className="text-neutral-400 text-sm uppercase tracking-widest font-semibold">Applications</h3>
            <p className="text-3xl font-bold mt-2">5</p>
          </div>
          <div className="bg-neutral-800 p-6 rounded-2xl border border-neutral-700 flex flex-col justify-center items-center hover:scale-105 transition-transform cursor-pointer">
            <TrendingUp className="text-amber-400 w-10 h-10 mb-3" />
            <h3 className="text-neutral-400 text-sm uppercase tracking-widest font-semibold">Skill Gaps Closed</h3>
            <p className="text-3xl font-bold mt-2">7</p>
          </div>
        </div>

        {/* Charts & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-neutral-800 p-8 rounded-3xl border border-neutral-700">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <TrendingUp className="mr-3 w-5 h-5 text-indigo-400" />
              Proficiency Analytics
            </h2>
            <div className="h-72 w-full">
              <ResponsiveContainer>
                <BarChart data={mockSkillData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#404040" vertical={false} />
                  <XAxis dataKey="name" stroke="#a3a3a3" tick={{fill: '#a3a3a3'}} />
                  <YAxis stroke="#a3a3a3" tick={{fill: '#a3a3a3'}} />
                  <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: '12px' }} />
                  <Bar dataKey="score" fill="url(#colorUv)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.4}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-neutral-800 p-8 rounded-3xl border border-neutral-700 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
            <div>
               <h2 className="text-xl font-semibold mb-4 text-white">Your Weekly Plan</h2>
               <div className="space-y-4">
                 <div className="p-4 bg-neutral-900 border border-neutral-700 rounded-xl">
                   <h4 className="font-medium text-emerald-400">#1 Priority</h4>
                   <p className="text-sm text-neutral-300 mt-1">Acquire System Design knowledge for Backend Role.</p>
                 </div>
                 <div className="p-4 bg-neutral-900 border border-neutral-700 rounded-xl">
                   <h4 className="font-medium text-blue-400">#2 Priority</h4>
                   <p className="text-sm text-neutral-300 mt-1">Improve React hooks expertise.</p>
                 </div>
               </div>
            </div>
            
            <button className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-4 rounded-xl transition-colors shadow-lg shadow-indigo-600/30">
              Refresh Plan
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
""",

    # Trainer Dashboard
    "src/app/dashboard/trainer/page.tsx": """'use client';
import { Users, AlertTriangle, Briefcase, Award } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export default function TrainerDashboard() {
  const mockDistribution = [
    { name: 'Highly Ready', value: 45 },
    { name: 'Needs Polish', value: 30 },
    { name: 'At Risk', value: 15 },
    { name: 'Not Started', value: 10 },
  ];
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                Trainer Overview
              </h1>
              <p className="text-neutral-400 mt-1">Monitor the overall cohort readiness metrics.</p>
            </div>
            <button className="mt-4 md:mt-0 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 px-6 py-2 rounded-lg font-medium transition-colors">
              Export Cohort Report
            </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative bg-neutral-900 border border-neutral-800 p-6 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-opacity opacity-0 group-hover:opacity-100"></div>
             <Users className="text-emerald-400 w-8 h-8 mb-4" />
             <p className="text-neutral-400 text-sm font-medium">Total Students</p>
             <p className="text-3xl font-bold mt-1">1,240</p>
          </div>
          <div className="group relative bg-neutral-900 border border-neutral-800 p-6 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-opacity opacity-0 group-hover:opacity-100"></div>
             <Award className="text-blue-400 w-8 h-8 mb-4" />
             <p className="text-neutral-400 text-sm font-medium">Avg Readiness Score</p>
             <p className="text-3xl font-bold mt-1">72.4%</p>
          </div>
          <div className="group relative bg-neutral-900 border border-neutral-800 p-6 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-opacity opacity-0 group-hover:opacity-100"></div>
             <Briefcase className="text-purple-400 w-8 h-8 mb-4" />
             <p className="text-neutral-400 text-sm font-medium">Active Roles</p>
             <p className="text-3xl font-bold mt-1">34</p>
          </div>
          <div className="group relative bg-neutral-900 border border-neutral-800 p-6 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-opacity opacity-0 group-hover:opacity-100"></div>
             <AlertTriangle className="text-amber-400 w-8 h-8 mb-4" />
             <p className="text-neutral-400 text-sm font-medium">Skill Gaps Detected</p>
             <p className="text-3xl font-bold mt-1">8 Core</p>
          </div>
        </div>

        {/* Charts & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl">
              <h2 className="text-xl font-semibold mb-6">Cohort Distribution by Readiness</h2>
               <div className="h-64 w-full">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={mockDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                        {mockDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: '8px' }} />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
               </div>
           </div>

           <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl">
              <h2 className="text-xl font-semibold mb-6">Top Systemic Gaps</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                    <div>
                        <h4 className="font-medium text-white">System Architecture</h4>
                        <p className="text-xs text-neutral-400 mt-1">Missing in 42% of cohort</p>
                    </div>
                    <span className="text-rose-400 text-sm font-semibold bg-rose-500/10 px-3 py-1 rounded-full">High Impact</span>
                </div>
                <div className="flex justify-between items-center bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                    <div>
                        <h4 className="font-medium text-white">GraphQL</h4>
                        <p className="text-xs text-neutral-400 mt-1">Missing in 38% of targets</p>
                    </div>
                    <span className="text-amber-400 text-sm font-semibold bg-amber-500/10 px-3 py-1 rounded-full">Medium Impact</span>
                </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
""",

    # Admin Dashboard
    "src/app/dashboard/admin/page.tsx": """'use client';
import { Activity, Database, Server, Shield } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function AdminDashboard() {
  const mockActivityData = [
    { time: '08:00', load: 20 },
    { time: '10:00', load: 45 },
    { time: '12:00', load: 80 },
    { time: '14:00', load: 60 },
    { time: '16:00', load: 90 },
    { time: '18:00', load: 50 },
    { time: '20:00', load: 30 },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-800 pb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-400 to-orange-500 bg-clip-text text-transparent flex items-center">
                 <Shield className="mr-3 w-8 h-8 text-rose-500" /> System Admin
              </h1>
              <p className="text-neutral-400 mt-2 text-sm uppercase tracking-widest font-semibold">Live Infrastructure Monitoring</p>
            </div>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
               <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
               </span>
               <span className="text-sm font-medium text-emerald-400">All Systems Operational</span>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
           <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg">
             <div className="flex items-center space-x-3 mb-2">
                <Database className="text-rose-400 w-5 h-5"/>
                <h3 className="font-semibold text-neutral-300">Database Load</h3>
             </div>
             <p className="text-2xl font-bold pl-8">14%</p>
             <div className="w-full bg-neutral-800 rounded-full h-1.5 mt-4">
                <div className="bg-rose-500 h-1.5 rounded-full w-[14%]"></div>
             </div>
           </div>
           
           <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg">
             <div className="flex items-center space-x-3 mb-2">
                <Server className="text-orange-400 w-5 h-5"/>
                <h3 className="font-semibold text-neutral-300">Celery Tasks (Queue)</h3>
             </div>
             <p className="text-2xl font-bold pl-8">0 pending</p>
             <p className="text-xs text-neutral-500 pl-8 mt-1">452 processed today</p>
           </div>
           
           <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg">
             <div className="flex items-center space-x-3 mb-2">
                <Activity className="text-indigo-400 w-5 h-5"/>
                <h3 className="font-semibold text-neutral-300">Registered Users</h3>
             </div>
             <p className="text-2xl font-bold pl-8 line-clamp-1">3,492 Total</p>
             <p className="text-xs text-emerald-400 pl-8 mt-1 font-medium">+24 this hour</p>
           </div>
        </div>

        {/* Main Chart */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
            <h2 className="text-xl font-semibold mb-6">Traffic & Request Load</h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linear.Gradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis dataKey="time" stroke="#737373" tick={{fill: '#737373', fontSize: 12}} />
                  <YAxis stroke="#737373" tick={{fill: '#737373', fontSize: 12}} />
                  <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="load" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorLoad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
        </div>

      </div>
    </div>
  );
}
"""
}

def generate():
    for filepath, content in files.items():
        base = os.path.dirname(filepath)
        if base:
            os.makedirs(base, exist_ok=True)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

if __name__ == "__main__":
    generate()
