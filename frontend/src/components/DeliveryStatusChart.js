import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Skeleton } from '../components/ui/skeleton';
import { Truck } from 'lucide-react';

const STATUS_COLORS = {
  'DELIVERED': '#15803D', 'PRIME DELIVERED': '#16A34A',
  'IN TRANSIT': '#D97706', 'OUT FOR DELIVERY': '#F59E0B',
  'ATTEMPTED': '#B45309', 'NO UPDATE': '#78716C', 'No update': '#78716C', 'NO update': '#78716C',
  'Order Cancelled': '#57534E', 'order cancelled': '#57534E',
  'Order Refunded': '#0F766E', 'Order refunded': '#0F766E', 'order refunded': '#0F766E', 'Order Refuned': '#0F766E',
  'PRIME ORDER': '#1C1917', 'Prime Order': '#1C1917',
  'Delhivery Order': '#44403C', 'ARRIVED': '#059669',
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

export default function DeliveryStatusChart({ data, loading, onSegmentClick }) {
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
    .map(d => ({
      name: d.status,
      value: d.count,
      fill: STATUS_COLORS[d.status] || DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
    }));

  const handleClick = (entry) => {
    if (onSegmentClick && entry && entry.name) {
      onSegmentClick(`Delivery: ${entry.name}`, { delivery_status_filter: entry.name });
    }
  };

  return (
    <div className="bg-white border border-[#E7E5E4] rounded-xl p-6 shadow-sm animate-fade-in-up" data-testid="delivery-status-chart">
      <div className="flex items-center gap-2 mb-1">
        <Truck className="w-4 h-4 text-[#D97706]" strokeWidth={1.5} />
        <h3 className="text-base font-semibold text-[#1C1917]" style={{ fontFamily: 'Manrope' }}>Delivery Status</h3>
      </div>
      {data.delayed_count > 0 && (
        <button
          onClick={() => onSegmentClick && onSegmentClick('Delayed Orders', { is_delayed: true })}
          className="text-xs text-[#BE123C] font-medium mb-3 hover:underline cursor-pointer"
          data-testid="delayed-count"
        >
          {data.delayed_count} orders delayed in transit - click to view
        </button>
      )}
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
