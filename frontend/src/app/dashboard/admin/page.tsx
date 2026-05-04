'use client';
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
                    </linearGradient>
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
