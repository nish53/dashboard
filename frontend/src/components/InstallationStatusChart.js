import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Skeleton } from '../components/ui/skeleton';
import { Wrench } from 'lucide-react';

const COLORS = {
  'Done': '#15803D', 'Pending': '#D97706', 'Arranged': '#0F766E',
  'No installation required': '#A8A29E', 'No Updates': '#78716C',
  'Order Cancelled': '#57534E', 'Replacement Pending': '#BE123C', 'Product Returned': '#44403C',
};
const DEFAULT_COLORS = ['#1C1917', '#D97706', '#15803D', '#BE123C', '#0F766E', '#57534E'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#E7E5E4] rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs font-medium text-[#1C1917]">{payload[0].name}</p>
        <p className="text-sm font-bold" style={{ color: payload[0].payload.fill }}>{payload[0].value.toLocaleString()}</p>
        <p className="text-[10px] text-[#A8A29E] mt-0.5">Click to view orders</p>
      </div>
    );
  }
  return null;
};

export default function InstallationStatusChart({ data, loading, onSegmentClick }) {
  if (loading || !data) {
    return (
      <div className="bg-white border border-[#E7E5E4] rounded-xl p-6 shadow-sm">
        <Skeleton className="h-5 w-36 mb-4" />
        <Skeleton className="h-[250px] w-full rounded-lg" />
      </div>
    );
  }

  const chartData = data.breakdown
    .filter(d => d.status && d.count > 0)
    .map((d, i) => ({
      name: d.status,
      value: d.count,
      fill: COLORS[d.status] || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    }));

  const handleClick = (entry) => {
    if (onSegmentClick && entry && entry.name) {
      onSegmentClick(`Installation: ${entry.name}`, { installation_filter: entry.name });
    }
  };

  return (
    <div className="bg-white border border-[#E7E5E4] rounded-xl p-6 shadow-sm animate-fade-in-up" data-testid="installation-status-chart">
      <div className="flex items-center gap-2 mb-1">
        <Wrench className="w-4 h-4 text-[#0F766E]" strokeWidth={1.5} />
        <h3 className="text-base font-semibold text-[#1C1917]" style={{ fontFamily: 'Manrope' }}>Installation Status</h3>
      </div>
      <div className="flex gap-4 mb-3">
        <button onClick={() => handleClick({ name: 'Pending' })} className="flex items-center gap-1.5 hover:opacity-70 cursor-pointer transition-opacity" data-testid="install-pending-badge">
          <div className="w-2 h-2 rounded-full bg-[#D97706]" />
          <span className="text-xs text-[#57534E]">Pending: <strong className="text-[#D97706]">{data.pending}</strong></span>
        </button>
        <button onClick={() => handleClick({ name: 'Arranged' })} className="flex items-center gap-1.5 hover:opacity-70 cursor-pointer transition-opacity" data-testid="install-arranged-badge">
          <div className="w-2 h-2 rounded-full bg-[#0F766E]" />
          <span className="text-xs text-[#57534E]">Arranged: <strong className="text-[#0F766E]">{data.arranged}</strong></span>
        </button>
        <button onClick={() => handleClick({ name: 'Done' })} className="flex items-center gap-1.5 hover:opacity-70 cursor-pointer transition-opacity" data-testid="install-done-badge">
          <div className="w-2 h-2 rounded-full bg-[#15803D]" />
          <span className="text-xs text-[#57534E]">Done: <strong className="text-[#15803D]">{data.done}</strong></span>
        </button>
      </div>
      <div className="flex gap-4">
        <div className="w-[180px] h-[220px] flex-shrink-0" style={{ minWidth: '180px', minHeight: '180px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
                onClick={handleClick}
                cursor="pointer"
              >
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.fill} className="hover:opacity-80 transition-opacity" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 overflow-y-auto max-h-[220px] space-y-1 pr-1">
          {chartData.map((entry, idx) => (
            <button
              key={idx}
              onClick={() => handleClick(entry)}
              className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded hover:bg-[#F5F5F4] transition-colors cursor-pointer"
            >
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.fill }} />
              <span className="text-xs text-[#57534E] truncate flex-1">{entry.name}</span>
              <span className="text-xs font-medium text-[#1C1917] flex-shrink-0">{entry.value.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
