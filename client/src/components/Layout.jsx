import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  Target,
  Building2,
  FileSpreadsheet,
  Settings,
  Bell,
  Search,
  LogOut,
  Menu,
  X,
  ChevronDown,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Quick clock in state
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchTodayStatus();
  }, [location.pathname]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/reports/notifications');
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTodayStatus = async () => {
    try {
      const res = await api.get('/attendance/today-status');
      setTodayAttendance(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClockIn = async () => {
    setActionLoading(true);
    try {
      const res = await api.post('/attendance/clock-in');
      setTodayAttendance(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error clocking in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setActionLoading(true);
    try {
      const res = await api.post('/attendance/clock-out');
      setTodayAttendance(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error clocking out');
    } finally {
      setActionLoading(false);
    }
  };

  const markNotification = async (id) => {
    try {
      await api.patch(`/reports/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Employees', href: '/employees', icon: Users },
    { name: 'Attendance', href: '/attendance', icon: Clock },
    { name: 'Leaves', href: '/leaves', icon: CalendarDays },
    { name: 'Performance', href: '/performance', icon: Target },
    { name: 'Departments', href: '/departments', icon: Building2 },
    { name: 'Reports & Export', href: '/reports', icon: FileSpreadsheet },
    ...(user?.role === 'Admin' || user?.role === 'HR'
      ? [{ name: 'Admin Panel', href: '/admin', icon: ShieldCheck }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 sm:px-6 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-100">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                People<span className="text-indigo-600">Pulse</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/50">
                HR Suite
              </span>
            </div>
          </div>
        </div>

        {/* Global Attendance Quick Action & Notification & Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Clock in/out Pill */}
          <div className="hidden md:flex items-center bg-slate-100 rounded-full p-1 border border-slate-200/80">
            {!todayAttendance?.clockIn ? (
              <button
                onClick={handleClockIn}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xs transition"
              >
                <Clock size={13} />
                Clock In
              </button>
            ) : !todayAttendance?.clockOut ? (
              <button
                onClick={handleClockOut}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-xs transition"
              >
                <CheckCircle2 size={13} />
                Clock Out
              </button>
            ) : (
              <span className="px-3 py-1 text-xs font-medium text-slate-600 flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-500" />
                Shift Done ({todayAttendance.workHours}h)
              </span>
            )}
          </div>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="font-semibold text-slate-800 text-sm">Notifications</h4>
                  <span className="text-xs bg-indigo-50 text-indigo-700 font-medium px-2 py-0.5 rounded-full">
                    {unreadCount} unread
                  </span>
                </div>
                <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-center py-6 text-xs text-slate-400">No recent notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => markNotification(n._id)}
                        className={`py-3 px-2 cursor-pointer hover:bg-slate-50 rounded-xl transition ${
                          !n.isRead ? 'bg-indigo-50/40' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                          <span className="text-[10px] text-slate-400">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdown(!userDropdown)}
              className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-100 transition"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white font-semibold flex items-center justify-center text-xs shadow-inner">
                {user?.name?.slice(0, 2).toUpperCase() || 'U'}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800">{user?.name}</span>
                <span className="text-[10px] font-medium text-slate-500">{user?.role}</span>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {userDropdown && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-100 p-2 z-50">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setUserDropdown(false);
                    navigate('/admin');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition"
                >
                  <Settings size={14} /> System Settings
                </button>
                <button
                  onClick={() => {
                    setUserDropdown(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main App Body */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-20'
          } transition-all duration-300 ease-in-out border-r border-slate-200 bg-white flex flex-col justify-between p-4 hidden md:flex`}
        >
          <div className="space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.href);
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  {sidebarOpen && <span>{item.name}</span>}
                </NavLink>
              );
            })}
          </div>

          {/* Quick status card in sidebar */}
          {sidebarOpen && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-violet-50/70 border border-indigo-100">
              <div className="flex items-center gap-2 text-indigo-900 font-semibold text-xs mb-1">
                <UserCheck size={15} />
                <span>Enterprise Portal</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Role: <span className="font-semibold text-indigo-700">{user?.role}</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Logged in as {user?.email}</p>
            </div>
          )}
        </aside>

        {/* Content View */}
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
