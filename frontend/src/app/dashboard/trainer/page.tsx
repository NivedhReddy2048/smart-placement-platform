'use client';
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
