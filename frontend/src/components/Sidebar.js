import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, LayoutDashboard, Upload, LogOut, X, Shield } from 'lucide-react';

export default function Sidebar({ isOpen, onClose, user, onLogout, onUpload, isAdmin, activePage }) {
  const location = useLocation();
  const currentPath = activePage || (location.pathname === '/admin' ? 'admin' : 'dashboard');

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />
      )}
      
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#1C1917] z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        data-testid="sidebar"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#292524]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-7 h-7 text-[#D97706]" strokeWidth={1.5} />
              <span className="text-lg font-bold text-[#F5F5F4]" style={{ fontFamily: 'Manrope' }}>CRM Panel</span>
            </div>
            <button onClick={onClose} className="lg:hidden text-[#A8A29E] hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/"
            onClick={onClose}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              currentPath === 'dashboard'
                ? 'text-[#F5F5F4] bg-[#292524]'
                : 'text-[#A8A29E] hover:text-[#F5F5F4] hover:bg-[#292524]'
            }`}
            data-testid="nav-dashboard"
          >
            <LayoutDashboard className={`w-4 h-4 ${currentPath === 'dashboard' ? 'text-[#D97706]' : ''}`} strokeWidth={1.5} />
            Dashboard
          </Link>
          <button
            onClick={() => { onUpload(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#A8A29E] hover:text-[#F5F5F4] hover:bg-[#292524] rounded-lg transition-colors"
            data-testid="nav-upload"
          >
            <Upload className="w-4 h-4" strokeWidth={1.5} />
            Upload Data
          </button>
          {isAdmin && (
            <Link
              to="/admin"
              onClick={onClose}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                currentPath === 'admin'
                  ? 'text-[#F5F5F4] bg-[#292524]'
                  : 'text-[#A8A29E] hover:text-[#F5F5F4] hover:bg-[#292524]'
              }`}
              data-testid="nav-admin"
            >
              <Shield className={`w-4 h-4 ${currentPath === 'admin' ? 'text-[#D97706]' : ''}`} strokeWidth={1.5} />
              User Management
            </Link>
          )}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-[#292524]">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#D97706] flex items-center justify-center text-sm font-bold text-white">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-[#F5F5F4] truncate">{user?.name || 'User'}</p>
                {isAdmin && <Shield className="w-3 h-3 text-[#D97706] flex-shrink-0" />}
              </div>
              <p className="text-xs text-[#A8A29E] truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#A8A29E] hover:text-[#F5F5F4] hover:bg-[#292524] rounded-lg transition-colors"
            data-testid="logout-button"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
