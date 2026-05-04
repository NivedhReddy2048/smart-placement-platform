'use client';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  yKey: string;
  color?: string;
}

export default function Charts({ data, xKey, yKey, color = "#4f46e5" }: ChartProps) {
  return (
    <div className="h-72 w-full mt-4">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey={xKey} stroke="#94a3b8" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
          <YAxis stroke="#94a3b8" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
            cursor={{fill: '#f8fafc'}}
          />
          <Bar dataKey={yKey} fill={color} radius={[6, 6, 0, 0]} maxBarSize={50} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
