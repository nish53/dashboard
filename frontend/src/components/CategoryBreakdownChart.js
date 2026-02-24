import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Skeleton } from '../components/ui/skeleton';
import { Grid3X3 } from 'lucide-react';

const CATEGORY_COLORS = [
  '#1C1917', '#D97706', '#15803D', '#BE123C', '#0F766E',
  '#57534E', '#B45309', '#44403C', '#059669', '#9F1239',
  '#78716C', '#F59E0B', '#16A34A', '#0D9488', '#A8A29E',
  '#7C3AED', '#DC2626', '#2563EB', '#7C2D12', '#064E3B',
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#E7E5E4] rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs font-medium text-[#1C1917]">{payload[0].payload.category || payload[0].name}</p>
        <p className="text-sm font-bold text-[#1C1917]">{payload[0].value.toLocaleString()} orders</p>
        <p className="text-[10px] text-[#A8A29E] mt-0.5">Click to view orders</p>
      </div>
    );
  }
  return null;
};

export default function CategoryBreakdownChart({ data, loading, onSegmentClick }) {
  if (loading || !data) {
    return (
      <div className="bg-white border border-[#E7E5E4] rounded-xl p-6 shadow-sm">
        <Skeleton className="h-5 w-36 mb-4" />
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </div>
    );
  }

  const chartData = data.breakdown.map((d, i) => ({
    category: d.category,
    count: d.count,
    fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  const handlePieClick = (entry) => {
    if (onSegmentClick && entry && entry.category) {
      onSegmentClick(`Category: ${entry.category}`, { category: entry.category });
    }
  };

  const handleBarClick = (entry) => {
    if (onSegmentClick && entry && entry.category) {
      onSegmentClick(`Category: ${entry.category}`, { category: entry.category });
    }
  };

  return (
    <div className="bg-white border border-[#E7E5E4] rounded-xl p-6 shadow-sm animate-fade-in-up" data-testid="category-breakdown-chart">
      <div className="flex items-center gap-2 mb-4">
        <Grid3X3 className="w-4 h-4 text-[#1C1917]" strokeWidth={1.5} />
        <h3 className="text-base font-semibold text-[#1C1917]" style={{ fontFamily: 'Manrope' }}>Category Breakdown</h3>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="h-[300px]" style={{ minWidth: '200px', minHeight: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="count"
                nameKey="category"
                stroke="none"
                onClick={handlePieClick}
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
        {/* Bar Chart */}
        <div className="h-[300px]" style={{ minWidth: '200px', minHeight: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" vertical={false} />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 9, fill: '#57534E' }}
                axisLine={{ stroke: '#E7E5E4' }}
                tickLine={false}
                interval={0}
                angle={-35}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 11, fill: '#A8A29E' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={24} onClick={handleBarClick} cursor="pointer">
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.fill} className="hover:opacity-80 transition-opacity" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-[#E7E5E4]">
        {chartData.map((d, i) => (
          <button
            key={i}
            onClick={() => onSegmentClick && onSegmentClick(`Category: ${d.category}`, { category: d.category })}
            className="flex items-center gap-1.5 hover:opacity-70 transition-opacity cursor-pointer"
          >
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.fill }} />
            <span className="text-xs text-[#57534E]">{d.category} ({d.count})</span>
          </button>
        ))}
      </div>
    </div>
  );
}
