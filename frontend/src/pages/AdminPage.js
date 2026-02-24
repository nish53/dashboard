import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { UserPlus, Trash2, Shield, User, Eye, EyeOff, KeyRound, Menu, X, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminPage() {
  const { api, user, logout, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Invite form
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [showInvitePass, setShowInvitePass] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMsg, setInviteMsg] = useState(null);

  // Reset password
  const [resetEmail, setResetEmail] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetMsg, setResetMsg] = useState(null);

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api().get('/admin/users');
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
    setLoading(false);
  }, [api]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteMsg(null);
    try {
      await api().post('/admin/invite', { name: inviteName, email: inviteEmail, password: invitePassword });
      setInviteMsg({ type: 'success', text: `User ${inviteEmail} invited successfully` });
      setInviteName(''); setInviteEmail(''); setInvitePassword('');
      fetchUsers();
    } catch (err) {
      setInviteMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to invite user' });
    }
    setInviteLoading(false);
  };

  const handleRemove = async (email) => {
    try {
      await api().delete(`/admin/users/${email}`);
      setDeleteConfirm(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to remove user');
    }
  };

  const handleResetPassword = async (email) => {
    if (!resetPassword || resetPassword.length < 6) {
      setResetMsg({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    try {
      await api().put(`/admin/users/${email}/reset-password`, { password: resetPassword });
      setResetMsg({ type: 'success', text: 'Password reset successfully' });
      setResetPassword('');
      setTimeout(() => { setResetEmail(null); setResetMsg(null); }, 2000);
    } catch (err) {
      setResetMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to reset password' });
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-[#BE123C] mx-auto mb-3" />
          <h2 className="text-xl font-bold text-[#1C1917]" style={{ fontFamily: 'Manrope' }}>Admin Access Required</h2>
          <p className="text-sm text-[#57534E] mt-2">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F9F8F6]" data-testid="admin-page">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={logout}
        onUpload={() => {}}
        isAdmin={isAdmin}
        activePage="admin"
      />

      <main className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-[#F9F8F6]/80 backdrop-blur-md border-b border-[#E7E5E4] px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3 max-w-[1200px] mx-auto">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-[#57534E] hover:text-[#1C1917] transition-colors"
              data-testid="admin-mobile-menu"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1C1917] tracking-tight" style={{ fontFamily: 'Manrope' }}>
                User Management
              </h1>
              <p className="text-xs text-[#A8A29E]">Invite and manage CRM access</p>
            </div>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto p-4 sm:p-6 space-y-6">
          {/* Invite New User Card */}
          <div className="bg-white border border-[#E7E5E4] rounded-xl p-6 shadow-sm" data-testid="invite-user-card">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus className="w-5 h-5 text-[#D97706]" strokeWidth={1.5} />
              <h2 className="text-lg font-semibold text-[#1C1917]" style={{ fontFamily: 'Manrope' }}>Invite New User</h2>
            </div>

            {inviteMsg && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm mb-4 ${
                inviteMsg.type === 'success' ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FFE4E6] text-[#BE123C]'
              }`} data-testid="invite-message">
                {inviteMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {inviteMsg.text}
              </div>
            )}

            <form onSubmit={handleInvite} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-[#57534E]">Name</Label>
                <Input
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="h-10 border-[#E7E5E4] bg-white"
                  data-testid="invite-name-input"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-[#57534E]">Email</Label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                  className="h-10 border-[#E7E5E4] bg-white"
                  data-testid="invite-email-input"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-[#57534E]">Password</Label>
                <div className="relative">
                  <Input
                    type={showInvitePass ? 'text' : 'password'}
                    value={invitePassword}
                    onChange={(e) => setInvitePassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                    minLength={6}
                    className="h-10 border-[#E7E5E4] bg-white pr-9"
                    data-testid="invite-password-input"
                  />
                  <button type="button" onClick={() => setShowInvitePass(!showInvitePass)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A8A29E]">
                    {showInvitePass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                disabled={inviteLoading}
                className="h-10 bg-[#1C1917] text-white hover:bg-[#292524] gap-2"
                data-testid="invite-submit-button"
              >
                <UserPlus className="w-4 h-4" />
                {inviteLoading ? 'Inviting...' : 'Invite'}
              </Button>
            </form>
          </div>

          {/* Users List */}
          <div className="bg-white border border-[#E7E5E4] rounded-xl shadow-sm overflow-hidden" data-testid="users-list-card">
            <div className="px-6 py-4 border-b border-[#E7E5E4]">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#1C1917]" strokeWidth={1.5} />
                <h2 className="text-lg font-semibold text-[#1C1917]" style={{ fontFamily: 'Manrope' }}>Users with Access</h2>
                <span className="ml-auto text-xs text-[#A8A29E] bg-[#F5F5F4] px-2 py-1 rounded-md">{users.length} users</span>
              </div>
            </div>

            {loading ? (
              <div className="px-6 py-8 text-center text-sm text-[#A8A29E]">Loading users...</div>
            ) : (
              <div className="divide-y divide-[#F5F5F4]">
                {users.map((u) => (
                  <div key={u.email} className="px-6 py-4 flex items-center gap-4 hover:bg-[#FAFAF9] transition-colors" data-testid={`user-row-${u.email}`}>
                    {/* Avatar */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${
                      u.role === 'admin' ? 'bg-[#D97706]' : 'bg-[#57534E]'
                    }`}>
                      {u.name?.[0]?.toUpperCase() || 'U'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[#1C1917] truncate">{u.name}</p>
                        {u.role === 'admin' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-[#FEF3C7] text-[#D97706]">
                            <Shield className="w-2.5 h-2.5" /> Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#A8A29E] truncate">{u.email}</p>
                    </div>

                    {/* Joined date */}
                    <div className="hidden sm:block text-xs text-[#A8A29E] flex-shrink-0">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {u.role !== 'admin' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setResetEmail(u.email); setResetPassword(''); setResetMsg(null); }}
                            className="h-8 w-8 p-0 text-[#57534E] hover:text-[#D97706] hover:bg-[#FEF3C7]"
                            title="Reset password"
                            data-testid={`reset-password-${u.email}`}
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm(u.email)}
                            className="h-8 w-8 p-0 text-[#57534E] hover:text-[#BE123C] hover:bg-[#FFE4E6]"
                            title="Remove user"
                            data-testid={`remove-user-${u.email}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                      {u.role === 'admin' && (
                        <span className="text-[10px] text-[#A8A29E] italic px-2">Protected</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" data-testid="delete-confirm-modal">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-[#1C1917] mb-2" style={{ fontFamily: 'Manrope' }}>Remove User</h3>
            <p className="text-sm text-[#57534E] mb-4">
              Are you sure you want to remove <strong>{deleteConfirm}</strong>? They will no longer be able to access the CRM.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="border-[#E7E5E4]" data-testid="cancel-delete">Cancel</Button>
              <Button onClick={() => handleRemove(deleteConfirm)} className="bg-[#BE123C] text-white hover:bg-[#9F1239]" data-testid="confirm-delete">Remove</Button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" data-testid="reset-password-modal">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-[#1C1917] mb-2" style={{ fontFamily: 'Manrope' }}>Reset Password</h3>
            <p className="text-sm text-[#57534E] mb-4">Set new password for <strong>{resetEmail}</strong></p>
            {resetMsg && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs mb-3 ${
                resetMsg.type === 'success' ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FFE4E6] text-[#BE123C]'
              }`}>
                {resetMsg.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                {resetMsg.text}
              </div>
            )}
            <Input
              type="password"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              placeholder="New password (min 6 chars)"
              className="h-10 border-[#E7E5E4] mb-4"
              data-testid="new-password-input"
            />
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => { setResetEmail(null); setResetMsg(null); }} className="border-[#E7E5E4]">Cancel</Button>
              <Button onClick={() => handleResetPassword(resetEmail)} className="bg-[#1C1917] text-white hover:bg-[#292524]" data-testid="confirm-reset-password">Reset</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
