import React from 'react';
import { Package, Truck, AlertTriangle, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';

const cards = [
  { key: 'total_orders', label: 'Total Orders', icon: Package, color: '#1C1917', bg: 'bg-[#1C1917]', queryKey: null },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2, color: '#15803D', bg: 'bg-[#15803D]', queryKey: 'delivery_status_filter', queryValue: '__all_delivered__' },
  { key: 'in_transit', label: 'In Transit', icon: Truck, color: '#D97706', bg: 'bg-[#D97706]', queryKey: 'delivery_status_filter', queryValue: '__all_transit__' },
  { key: 'delayed', label: 'Delayed', icon: AlertTriangle, color: '#BE123C', bg: 'bg-[#BE123C]', queryKey: 'is_delayed', queryValue: true },
  { key: 'cancelled', label: 'Cancelled', icon: XCircle, color: '#57534E', bg: 'bg-[#57534E]', queryKey: 'delivery_status_filter', queryValue: '__all_cancelled__' },
  { key: 'refunded', label: 'Refunded', icon: RotateCcw, color: '#0F766E', bg: 'bg-[#0F766E]', queryKey: 'delivery_status_filter', queryValue: '__all_refunded__' },
];

export default function KPICards({ summary, loading, onCardClick }) {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4" data-testid="kpi-cards-loading">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white border border-[#E7E5E4] rounded-xl p-5">
            <Skeleton className="h-4 w-20 mb-3" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4" data-testid="kpi-cards">
      {cards.map((card, idx) => {
        const count = summary[card.key] || 0;
        const isClickable = card.queryKey !== null && count > 0;
        return (
          <div
            key={card.key}
            onClick={() => {
              if (isClickable && onCardClick) {
                const params = {};
                params[card.queryKey] = card.queryValue;
                onCardClick(`${card.label} Orders`, params);
              }
            }}
            className={`bg-white border border-[#E7E5E4] rounded-xl p-5 shadow-sm transition-all duration-200 animate-fade-in-up stagger-${idx + 1} ${
              isClickable ? 'cursor-pointer hover:shadow-lg hover:border-[#D97706] hover:-translate-y-0.5 active:scale-[0.98]' : ''
            }`}
            data-testid={`kpi-${card.key}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#57534E]">{card.label}</span>
              <div className={`${card.bg} w-7 h-7 rounded-md flex items-center justify-center`}>
                <card.icon className="w-3.5 h-3.5 text-white" strokeWidth={2} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: card.color, fontFamily: 'Manrope' }}>
              {count.toLocaleString()}
            </p>
            {isClickable && (
              <p className="text-[10px] text-[#A8A29E] mt-1.5 uppercase tracking-wide">Click to view details</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
