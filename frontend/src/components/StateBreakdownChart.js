import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '../components/ui/skeleton';
import { MapPin } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#E7E5E4] rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs font-medium text-[#57534E]">{label}</p>
        <p className="text-sm font-bold text-[#D97706]">{payload[0].value.toLocaleString()} orders</p>
      </div>
    );
  }
  return null;
};

export default function StateBreakdownChart({ data, loading }) {
  if (loading || !data) {
    return (
      <div className="bg-white border border-[#E7E5E4] rounded-xl p-6 shadow-sm">
        <Skeleton className="h-5 w-36 mb-4" />
        <Skeleton className="h-[280px] w-full rounded-lg" />
      </div>
    );
  }

  const chartData = data.breakdown.slice(0, 15).map(d => ({
    state: d.state?.length > 12 ? d.state.substring(0, 12) + '..' : d.state,
    fullState: d.state,
    count: d.count,
  }));

  return (
    <div className="bg-white border border-[#E7E5E4] rounded-xl p-6 shadow-sm animate-fade-in-up" data-testid="state-breakdown-chart">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-4 h-4 text-[#D97706]" strokeWidth={1.5} />
        <h3 className="text-base font-semibold text-[#1C1917]" style={{ fontFamily: 'Manrope' }}>Top States by Orders</h3>
      </div>
      <div className="h-[280px]" style={{ minWidth: '200px', minHeight: '200px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: '#A8A29E' }}
              axisLine={{ stroke: '#E7E5E4' }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="state"
              tick={{ fontSize: 10, fill: '#57534E' }}
              axisLine={false}
              tickLine={false}
              width={100}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white border border-[#E7E5E4] rounded-lg px-3 py-2 shadow-lg">
                      <p className="text-xs font-medium text-[#57534E]">{payload[0].payload.fullState}</p>
                      <p className="text-sm font-bold text-[#D97706]">{payload[0].value.toLocaleString()} orders</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" fill="#D97706" radius={[0, 4, 4, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
