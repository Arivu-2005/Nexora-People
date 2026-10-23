import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  CalendarCheck,
  TrendingUp,
  Star,
  ArrowUpRight,
  PlusCircle,
  FileText,
  Building,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    onLeaveEmployees: 0,
    pendingLeaves: 0,
    avgPerformanceScore: '4.5',
  });
  const [departmentStats, setDepartmentStats] = useState([]);
  const [attendanceTrends, setAttendanceTrends] = useState([]);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [recentGoals, setRecentGoals] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/dashboard');
      if (res.data.success) {
        setStats(res.data.stats);
        setDepartmentStats(res.data.departmentStats || []);
        setAttendanceTrends(res.data.attendanceTrends || []);
        setRecentLeaves(res.data.recentLeaves || []);
        setRecentGoals(res.data.recentGoals || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Workforce',
      value: stats.totalEmployees,
      sub: 'Active employees',
      icon: Users,
      color: 'from-blue-600 to-indigo-600',
      badge: '+4% this month',
    },
    {
      title: 'Present Today',
      value: stats.presentToday,
      sub: 'Clocked in',
      icon: UserCheck,
      color: 'from-emerald-500 to-teal-600',
      badge: '92% attendance rate',
    },
    {
      title: 'Pending Leaves',
      value: stats.pendingLeaves,
      sub: 'Requires approval',
      icon: CalendarCheck,
      color: 'from-amber-500 to-orange-500',
      badge: 'Action required',
    },
    {
      title: 'Avg Performance',
      value: `${stats.avgPerformanceScore} / 5.0`,
      sub: 'Across all teams',
      icon: Star,
      color: 'from-violet-600 to-purple-600',
      badge: 'Q1 Review cycle',
    },
  ];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              {user?.role} Portal
            </span>
            <span className="text-xs text-slate-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Here is your daily operational summary for employee performance, attendance, and leave requests.
          </p>
        </div>

        {/* Quick Action buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {(user?.role === 'Admin' || user?.role === 'HR') && (
            <button
              onClick={() => navigate('/employees')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition"
            >
              <PlusCircle size={15} />
              Add Employee
            </button>
          )}
          <button
            onClick={() => navigate('/leaves')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition backdrop-blur-sm"
          >
            <CalendarCheck size={15} />
            Request Leave
          </button>
          <button
            onClick={() => navigate('/performance')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition backdrop-blur-sm"
          >
            <Star size={15} />
            Add Review
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">{card.title}</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{card.value}</p>
                </div>
                <div className={`p-3 rounded-2xl bg-gradient-to-tr ${card.color} text-white shadow-md`}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px] pt-3 border-t border-slate-100">
                <span className="text-slate-500">{card.sub}</span>
                <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {card.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trends */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Attendance & Punctuality Trends</h3>
              <p className="text-xs text-slate-400">Past 7 days work shifts check-ins</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-medium">
              Daily metrics
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="present" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#presentGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Workforce Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Headcount by Department</h3>
                <p className="text-xs text-slate-400">Team distribution</p>
              </div>
              <Building size={18} className="text-slate-400" />
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentStats}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                  >
                    {departmentStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 mt-2 pt-3 border-t border-slate-100">
            {departmentStats.map((dept, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="text-slate-700 font-medium">{dept.name}</span>
                </div>
                <span className="font-bold text-slate-900">{dept.count} members</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Grid: Pending Approvals & Performance Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Leave Requests */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Recent Leave Requests</h3>
            <button
              onClick={() => navigate('/leaves')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View all <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentLeaves.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No leave requests found</p>
            ) : (
              recentLeaves.map((leave) => (
                <div key={leave._id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                      {leave.employee?.firstName?.[0]}
                      {leave.employee?.lastName?.[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {leave.employee?.firstName} {leave.employee?.lastName}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {leave.leaveType} • {leave.totalDays} day(s)
                      </p>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        leave.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : leave.status === 'Rejected'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {leave.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* High Impact Strategic Goals */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Active Performance Goals</h3>
            <button
              onClick={() => navigate('/performance')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View goals <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="space-y-3.5">
            {recentGoals.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No goals active</p>
            ) : (
              recentGoals.map((g) => (
                <div key={g._id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800 line-clamp-1">{g.title}</span>
                    <span className="text-xs font-extrabold text-indigo-600">{g.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-1.5">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${g.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>Target: {new Date(g.targetDate).toLocaleDateString()}</span>
                    <span>Assigned: {g.employee?.firstName} {g.employee?.lastName}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
