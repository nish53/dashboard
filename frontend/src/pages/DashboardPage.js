import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import KPICards from '../components/KPICards';
import DeliveryStatusChart from '../components/DeliveryStatusChart';
import InstallationStatusChart from '../components/InstallationStatusChart';
import FeedbackStatusChart from '../components/FeedbackStatusChart';
import SalesTrendChart from '../components/SalesTrendChart';
import CategoryBreakdownChart from '../components/CategoryBreakdownChart';
import StateBreakdownChart from '../components/StateBreakdownChart';
import FilterBar from '../components/FilterBar';
import CSVUploadModal from '../components/CSVUploadModal';
import OrderDetailsPanel from '../components/OrderDetailsPanel';
import { RefreshCw, Upload, Menu, X } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function DashboardPage() {
  const { api, logout, user, isAdmin } = useAuth();
  const [filters, setFilters] = useState({ date_from: null, date_to: null, product: null, category: null, account: null });
  const [filterOptions, setFilterOptions] = useState({ products: [], categories: [], accounts: [], min_date: null, max_date: null });
  const [summary, setSummary] = useState(null);
  const [deliveryData, setDeliveryData] = useState(null);
  const [installationData, setInstallationData] = useState(null);
  const [feedbackData, setFeedbackData] = useState(null);
  const [salesTrend, setSalesTrend] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [stateData, setStateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dataStatus, setDataStatus] = useState(null);

  // Order details panel state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsTitle, setDetailsTitle] = useState('');
  const [detailsQuery, setDetailsQuery] = useState({});

  const buildParams = useCallback(() => {
    const p = {};
    if (filters.date_from) p.date_from = filters.date_from;
    if (filters.date_to) p.date_to = filters.date_to;
    if (filters.product) p.product = filters.product;
    if (filters.category) p.category = filters.category;
    if (filters.account) p.account = filters.account;
    return { params: p };
  }, [filters]);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const params = buildParams();
      const [sumRes, delRes, instRes, fbRes, trendRes, catRes, stRes, filterRes, statusRes] = await Promise.all([
        api().get('/dashboard/summary', params),
        api().get('/dashboard/delivery-status', params),
        api().get('/dashboard/installation-status', params),
        api().get('/dashboard/feedback-status', params),
        api().get('/dashboard/sales-trend', params),
        api().get('/dashboard/category-breakdown', params),
        api().get('/dashboard/state-breakdown', params),
        api().get('/dashboard/filters'),
        api().get('/dashboard/data-status'),
      ]);
      setSummary(sumRes.data);
      setDeliveryData(delRes.data);
      setInstallationData(instRes.data);
      setFeedbackData(fbRes.data);
      setSalesTrend(trendRes.data);
      setCategoryData(catRes.data);
      setStateData(stRes.data);
      setFilterOptions(filterRes.data);
      setDataStatus(statusRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    }
    setLoading(false);
  }, [api, buildParams]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => fetchAllData(), 300);
      return () => clearTimeout(timer);
    }
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  // Open order details panel
  const openDetails = (title, queryParams) => {
    setDetailsTitle(title);
    setDetailsQuery(queryParams);
    setDetailsOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-[#F9F8F6]" data-testid="dashboard-page">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        user={user} 
        onLogout={logout}
        onUpload={() => setShowUpload(true)}
        isAdmin={isAdmin}
      />

      <main className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-[#F9F8F6]/80 backdrop-blur-md border-b border-[#E7E5E4] px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between max-w-[1600px] mx-auto">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-[#57534E] hover:text-[#1C1917] transition-colors"
                data-testid="mobile-menu-toggle"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#1C1917] tracking-tight" style={{ fontFamily: 'Manrope' }}>
                  Dashboard
                </h1>
                {dataStatus && (
                  <p className="text-xs text-[#A8A29E]">{dataStatus.total_records?.toLocaleString()} records loaded</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowUpload(true)}
                variant="outline"
                size="sm"
                className="border-[#E7E5E4] text-[#57534E] hover:bg-[#F5F5F4] gap-2 hidden sm:flex"
                data-testid="upload-csv-button"
              >
                <Upload className="w-4 h-4" />
                Upload CSV
              </Button>
              <Button
                onClick={fetchAllData}
                variant="outline"
                size="sm"
                className="border-[#E7E5E4] text-[#57534E] hover:bg-[#F5F5F4] gap-2"
                data-testid="refresh-button"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="max-w-[1600px] mx-auto p-4 sm:p-6 space-y-6">
          {/* Filter Bar */}
          <FilterBar
            filters={filters}
            filterOptions={filterOptions}
            onFilterChange={handleFilterChange}
          />

          {/* KPI Cards - Interactive */}
          <KPICards summary={summary} loading={loading} onCardClick={openDetails} />

          {/* Charts Row 1 - Interactive */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <DeliveryStatusChart data={deliveryData} loading={loading} onSegmentClick={openDetails} />
            <InstallationStatusChart data={installationData} loading={loading} onSegmentClick={openDetails} />
            <FeedbackStatusChart data={feedbackData} loading={loading} onSegmentClick={openDetails} />
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesTrendChart data={salesTrend} loading={loading} />
            <StateBreakdownChart data={stateData} loading={loading} />
          </div>

          {/* Charts Row 3 */}
          <div className="grid grid-cols-1 gap-6">
            <CategoryBreakdownChart data={categoryData} loading={loading} onSegmentClick={openDetails} />
          </div>
        </div>
      </main>

      {/* CSV Upload Modal */}
      {showUpload && (
        <CSVUploadModal onClose={() => setShowUpload(false)} onSuccess={() => { setShowUpload(false); fetchAllData(); }} />
      )}

      {/* Order Details Panel */}
      <OrderDetailsPanel
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title={detailsTitle}
        queryParams={detailsQuery}
        filters={filters}
      />
    </div>
  );
}
