import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  color?: string;
}

export default function StatsCard({ title, value, icon, trend, color = 'blue' }: StatsCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
            <p className="mt-2 text-3xl font-extrabold text-gray-900">{value}</p>
          </div>
          <div className={`p-3 rounded-full bg-${color}-50 text-${color}-600`}>
             {icon}
          </div>
        </div>
        {trend && (
          <div className="mt-4">
            <span className="text-sm font-medium text-emerald-600">{trend}</span>
            <span className="text-sm text-gray-500 ml-2">vs last week</span>
          </div>
        )}
      </div>
    </div>
  );
}
