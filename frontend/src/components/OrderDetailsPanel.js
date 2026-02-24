import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';

const COLUMNS = [
  { key: 'order_id', label: 'Order ID', width: 'min-w-[180px]' },
  { key: 'order_date', label: 'Order Date', width: 'min-w-[100px]' },
  { key: 'customer_name', label: 'Customer', width: 'min-w-[140px]' },
  { key: 'product_name', label: 'Product', width: 'min-w-[200px]' },
  { key: 'category', label: 'Category', width: 'min-w-[100px]' },
  { key: 'tracking_id', label: 'Tracking ID', width: 'min-w-[130px]' },
  { key: 'delivery_status', label: 'Delivery Status', width: 'min-w-[130px]' },
  { key: 'promised_delivery_date', label: 'Promised Date', width: 'min-w-[110px]' },
  { key: 'actual_ship_date', label: 'Dispatch Date', width: 'min-w-[110px]' },
  { key: 'actual_delivery_date', label: 'Delivered Date', width: 'min-w-[110px]' },
  { key: 'installation_updates', label: 'Installation', width: 'min-w-[110px]' },
  { key: 'feedback_status', label: 'Feedback', width: 'min-w-[130px]' },
  { key: 'state', label: 'State', width: 'min-w-[120px]' },
  { key: 'city', label: 'City', width: 'min-w-[110px]' },
  { key: 'phone', label: 'Phone', width: 'min-w-[120px]' },
  { key: 'account', label: 'Account', width: 'min-w-[140px]' },
];

function StatusBadge({ value }) {
  if (!value) return <span className="text-[#A8A29E]">-</span>;
  const v = value.toUpperCase();
  let cls = 'bg-[#F5F5F4] text-[#57534E]';
  if (v.includes('DELIVERED') || v === 'DONE' || v.includes('HAPPY') || v.includes('REVIEW DONE')) cls = 'bg-[#DCFCE7] text-[#15803D]';
  else if (v.includes('TRANSIT') || v.includes('OUT FOR') || v === 'ARRANGED') cls = 'bg-[#FEF3C7] text-[#B45309]';
  else if (v.includes('DELAY') || v.includes('PENDING') || v.includes('NOT HAPPY') || v.includes('NEGATIVE')) cls = 'bg-[#FFE4E6] text-[#BE123C]';
  else if (v.includes('CANCEL') || v.includes('RETURN')) cls = 'bg-[#F5F5F4] text-[#57534E]';
  return <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${cls}`}>{value}</span>;
}

export default function OrderDetailsPanel({ isOpen, onClose, title, queryParams, filters }) {
  const { api } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchOrders = useCallback(async (p) => {
    setLoading(true);
    try {
      const params = { ...queryParams, page: p, page_size: 50 };
      if (filters?.date_from) params.date_from = filters.date_from;
      if (filters?.date_to) params.date_to = filters.date_to;
      if (filters?.product) params.product = filters.product;
      if (filters?.category) params.category = filters.category;
      if (filters?.account) params.account = filters.account;

      const res = await api().get('/dashboard/orders', { params });
      setOrders(res.data.orders);
      setTotalPages(res.data.total_pages);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    }
    setLoading(false);
  }, [api, queryParams, filters]);

  useEffect(() => {
    if (isOpen) {
      setPage(1);
      fetchOrders(1);
    }
  }, [isOpen, fetchOrders]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchOrders(newPage);
  };

  if (!isOpen) return null;

  const statusColumns = ['delivery_status', 'installation_updates', 'feedback_status'];

  return (
    <div className="fixed inset-0 z-50 flex" data-testid="order-details-panel">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-[90vw] lg:max-w-[80vw] bg-white shadow-2xl flex flex-col animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E5E4] bg-[#F9F8F6]">
          <div>
            <h2 className="text-lg font-bold text-[#1C1917]" style={{ fontFamily: 'Manrope' }} data-testid="panel-title">
              {title}
            </h2>
            <p className="text-xs text-[#A8A29E] mt-0.5">{total.toLocaleString()} orders found</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#E7E5E4] text-[#57534E] hover:text-[#1C1917] transition-colors"
            data-testid="close-details-panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 text-[#D97706] animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-sm text-[#A8A29E]">No orders found</div>
          ) : (
            <table className="w-full text-left" data-testid="orders-table">
              <thead className="sticky top-0 bg-[#F9F8F6] z-10">
                <tr>
                  <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-[#57534E] border-b border-[#E7E5E4] min-w-[40px]">#</th>
                  {COLUMNS.map(col => (
                    <th key={col.key} className={`px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-[#57534E] border-b border-[#E7E5E4] ${col.width}`}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => (
                  <tr
                    key={order.order_id + '-' + idx}
                    className={`border-b border-[#F5F5F4] hover:bg-[#FAFAF9] transition-colors ${order.is_delayed ? 'bg-[#FFF1F2]' : ''}`}
                  >
                    <td className="px-3 py-2.5 text-xs text-[#A8A29E]">{(page - 1) * 50 + idx + 1}</td>
                    {COLUMNS.map(col => (
                      <td key={col.key} className={`px-3 py-2.5 text-xs text-[#1C1917] ${col.width}`}>
                        {statusColumns.includes(col.key) ? (
                          <StatusBadge value={order[col.key]} />
                        ) : (
                          order[col.key] || <span className="text-[#D6D3D1]">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-[#E7E5E4] bg-[#F9F8F6]">
            <p className="text-xs text-[#A8A29E]">
              Page {page} of {totalPages} ({total.toLocaleString()} total)
            </p>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="h-7 w-7 p-0 border-[#E7E5E4]"
                data-testid="prev-page-button"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="h-7 w-7 p-0 border-[#E7E5E4]"
                data-testid="next-page-button"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
