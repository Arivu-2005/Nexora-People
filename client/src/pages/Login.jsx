import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('admin@peoplepulse.com');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email.trim().toLowerCase(), password.trim());
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail) => {
    setError('');
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-200">
            <span className="text-2xl font-black">P</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">PeoplePulse HR</h2>
          <p className="text-xs text-slate-500 mt-1">Enterprise Employee Performance & HR Operations</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-600">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition"
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Demo Credentials Switcher */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 text-center">
            Demo Quick Accounts (Password: Password123!)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickFill('admin@peoplepulse.com')}
              className="px-2.5 py-1.5 text-[11px] font-medium bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg border border-slate-200 transition text-left"
            >
              👑 Admin (Full Access)
            </button>
            <button
              onClick={() => handleQuickFill('hr@peoplepulse.com')}
              className="px-2.5 py-1.5 text-[11px] font-medium bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg border border-slate-200 transition text-left"
            >
              👥 HR Specialist
            </button>
            <button
              onClick={() => handleQuickFill('manager@peoplepulse.com')}
              className="px-2.5 py-1.5 text-[11px] font-medium bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg border border-slate-200 transition text-left"
            >
              💼 Team Manager
            </button>
            <button
              onClick={() => handleQuickFill('employee@peoplepulse.com')}
              className="px-2.5 py-1.5 text-[11px] font-medium bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg border border-slate-200 transition text-left"
            >
              💻 Employee (Self-Service)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
