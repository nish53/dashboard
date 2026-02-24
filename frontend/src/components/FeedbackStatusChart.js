import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Skeleton } from '../components/ui/skeleton';
import { MessageSquare } from 'lucide-react';

const COLORS = {
  'Review done': '#15803D', 'Review Done': '#15803D',
  'Happy': '#16A34A', 'happy': '#16A34A',
  'Happy 2': '#22C55E', 'Happy 3': '#4ADE80', 'Happy 4': '#86EFAC',
  'Happy and Link Shared': '#059669', 'Happy and Link shared': '#059669',
  'Happy N link shared 2': '#0D9488', 'Happy N link shared 3': '#14B8A6',
  'Happy, Follow Up': '#0F766E',
  'Not Happy': '#BE123C', 'not happy': '#BE123C',
  'Disconnected': '#78716C', 'disconnected': '#78716C',
  'Callback': '#D97706', 'callback': '#D97706',
  'Follow Up': '#B45309', 'Returned': '#57534E',
  'Negative Rating': '#9F1239', 'Not Intrested': '#A8A29E', 'not connected': '#A8A29E',
  'Language Issue': '#44403C', 'language issue': '#44403C',
  'Installation pending': '#D97706', 'Replacement pending': '#BE123C',
};
const DEFAULT_COLORS = ['#1C1917', '#D97706', '#15803D', '#BE123C', '#0F766E', '#57534E', '#B45309', '#44403C'];

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

export default function FeedbackStatusChart({ data, loading, onSegmentClick }) {
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
    .slice(0, 10)
    .map((d, i) => ({
      name: d.status,
      value: d.count,
      fill: COLORS[d.status] || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    }));

  const handleClick = (entry) => {
    if (onSegmentClick && entry && entry.name) {
      onSegmentClick(`Feedback: ${entry.name}`, { feedback_filter: entry.name });
    }
  };

  return (
    <div className="bg-white border border-[#E7E5E4] rounded-xl p-6 shadow-sm animate-fade-in-up" data-testid="feedback-status-chart">
      <div className="flex items-center gap-2 mb-1">
        <MessageSquare className="w-4 h-4 text-[#15803D]" strokeWidth={1.5} />
        <h3 className="text-base font-semibold text-[#1C1917]" style={{ fontFamily: 'Manrope' }}>Review & Feedback</h3>
      </div>
      <div className="flex gap-4 mb-3">
        <button onClick={() => handleClick({ name: 'Review done' })} className="flex items-center gap-1.5 hover:opacity-70 cursor-pointer transition-opacity" data-testid="review-done-badge">
          <div className="w-2 h-2 rounded-full bg-[#15803D]" />
          <span className="text-xs text-[#57534E]">Reviews Done: <strong className="text-[#15803D]">{data.review_done}</strong></span>
        </button>
        <button onClick={() => handleClick({ name: 'Happy' })} className="flex items-center gap-1.5 hover:opacity-70 cursor-pointer transition-opacity" data-testid="happy-badge">
          <div className="w-2 h-2 rounded-full bg-[#16A34A]" />
          <span className="text-xs text-[#57534E]">Happy: <strong className="text-[#16A34A]">{data.happy_count}</strong></span>
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
