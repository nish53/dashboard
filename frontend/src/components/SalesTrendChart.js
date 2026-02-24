import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Skeleton } from '../components/ui/skeleton';
import { TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#E7E5E4] rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs font-medium text-[#57534E]">{label}</p>
        <p className="text-sm font-bold text-[#1C1917]">{payload[0].value.toLocaleString()} orders</p>
      </div>
    );
  }
  return null;
};

export default function SalesTrendChart({ data, loading }) {
  if (loading || !data) {
    return (
      <div className="bg-white border border-[#E7E5E4] rounded-xl p-6 shadow-sm">
        <Skeleton className="h-5 w-36 mb-4" />
        <Skeleton className="h-[280px] w-full rounded-lg" />
      </div>
    );
  }

  const chartData = data.trend.map(d => ({
    month: d.month,
    orders: d.orders,
  }));

  return (
    <div className="bg-white border border-[#E7E5E4] rounded-xl p-6 shadow-sm animate-fade-in-up" data-testid="sales-trend-chart">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-[#1C1917]" strokeWidth={1.5} />
        <h3 className="text-base font-semibold text-[#1C1917]" style={{ fontFamily: 'Manrope' }}>Order Trend</h3>
      </div>
      <div className="h-[280px]" style={{ minWidth: '200px', minHeight: '200px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1C1917" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#1C1917" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#A8A29E' }}
              axisLine={{ stroke: '#E7E5E4' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#A8A29E' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="orders"
              stroke="#1C1917"
              strokeWidth={2}
              fill="url(#areaGrad)"
              dot={{ fill: '#1C1917', r: 3, strokeWidth: 0 }}
              activeDot={{ fill: '#D97706', r: 5, strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
