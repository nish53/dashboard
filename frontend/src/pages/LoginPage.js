import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Package, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Contact your admin for access.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex" data-testid="login-page">
      {/* Left Panel - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.pexels.com/photos/15016524/pexels-photo-15016524.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
          alt="Workshop"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-[#1C1917]/70 flex flex-col justify-end p-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-[#D97706]" strokeWidth={1.5} />
              <h1 className="text-3xl font-bold text-[#F5F5F4]" style={{ fontFamily: 'Manrope' }}>CRM Dashboard</h1>
            </div>
            <p className="text-[#A8A29E] text-lg max-w-md leading-relaxed">
              Track orders, manage deliveries, and gain insights from your business data — all in one place.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F9F8F6]">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3 mb-2">
            <Package className="w-7 h-7 text-[#D97706]" strokeWidth={1.5} />
            <span className="text-xl font-bold text-[#1C1917]" style={{ fontFamily: 'Manrope' }}>CRM Dashboard</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#1C1917] tracking-tight" style={{ fontFamily: 'Manrope' }}>
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-[#57534E]">
              Sign in to access your dashboard. Contact admin for access.
            </p>
          </div>

          {error && (
            <div className="bg-[#BE123C]/10 border border-[#BE123C]/20 text-[#BE123C] px-4 py-3 rounded-lg text-sm" data-testid="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" data-testid="auth-form">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-[#57534E]">Email</Label>
              <Input
                id="email"
                type="email"
                data-testid="auth-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="h-11 border-[#E7E5E4] bg-white focus-visible:ring-[#1C1917] placeholder:text-[#A8A29E]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-[#57534E]">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  data-testid="auth-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="h-11 border-[#E7E5E4] bg-white focus-visible:ring-[#1C1917] placeholder:text-[#A8A29E] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#57534E] transition-colors"
                  data-testid="toggle-password-visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              data-testid="auth-submit-button"
              className="w-full h-11 bg-[#1C1917] text-white hover:bg-[#292524] rounded-lg text-sm font-medium transition-all active:scale-[0.98] gap-2"
            >
              {loading ? 'Please wait...' : 'Sign In'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-xs text-[#A8A29E]">
              Access is invite-only. Please contact your administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
