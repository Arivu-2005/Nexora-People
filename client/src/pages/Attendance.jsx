import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  StopCircle,
  Filter,
  Users,
  Search,
} from 'lucide-react';

const Attendance = () => {
  const { user } = useAuth();
  const isHRorAdmin = user?.role === 'Admin' || user?.role === 'HR';

  const [records, setRecords] = useState([]);
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Manual log modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [manualForm, setManualForm] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    clockIn: '2026-10-23T09:00',
    clockOut: '2026-10-23T17:30',
    notes: 'Approved HR adjustment',
  });

  useEffect(() => {
    fetchRecords();
    fetchToday();
    if (isHRorAdmin) fetchEmployeeList();
  }, [statusFilter, dateFilter]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (dateFilter) params.date = dateFilter;

      const res = await api.get('/attendance', { params });
      setRecords(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchToday = async () => {
    try {
      const res = await api.get('/attendance/today-status');
      setTodayStatus(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmployeeList = async () => {
    try {
      const res = await api.get('/employees');
      setEmployees(res.data.data || []);
      if (res.data.data?.length > 0 && !manualForm.employeeId) {
        setManualForm((prev) => ({ ...prev, employeeId: res.data.data[0]._id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClockIn = async () => {
    setActionLoading(true);
    try {
      const res = await api.post('/attendance/clock-in');
      setTodayStatus(res.data.data);
      fetchRecords();
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
      setTodayStatus(res.data.data);
      fetchRecords();
    } catch (err) {
      alert(err.response?.data?.message || 'Error clocking out');
    } finally {
      setActionLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/attendance/manual', manualForm);
      setShowManualModal(false);
      fetchRecords();
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting manual attendance');
    }
  };

  return (
    <div className="space-y-6">
      {/* Attendance Header & Self-Service Clock Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Clock size={16} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Time & Shift Management</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Daily Attendance Tracking</h1>
          <p className="text-xs text-slate-500 mt-1">
            Current system time: <span className="font-semibold text-slate-700">{new Date().toLocaleTimeString()}</span>
          </p>
        </div>

        {/* Check-in Card Widget */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 w-full md:w-auto">
          <div>
            <p className="text-xs font-semibold text-slate-700">Today's Shift Status</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  todayStatus?.clockIn && !todayStatus?.clockOut
                    ? 'bg-emerald-500 animate-pulse'
                    : todayStatus?.clockOut
                    ? 'bg-blue-500'
                    : 'bg-amber-400'
                }`}
              ></span>
              <span className="text-xs font-bold text-slate-900">
                {todayStatus?.clockIn && !todayStatus?.clockOut
                  ? `Active Shift (Started ${new Date(todayStatus.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
                  : todayStatus?.clockOut
                  ? `Completed (${todayStatus.workHours} hrs)`
                  : 'Not Clocked In'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!todayStatus?.clockIn ? (
              <button
                onClick={handleClockIn}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md transition"
              >
                <PlayCircle size={15} />
                Clock In
              </button>
            ) : !todayStatus?.clockOut ? (
              <button
                onClick={handleClockOut}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl shadow-md transition"
              >
                <StopCircle size={15} />
                Clock Out
              </button>
            ) : (
              <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Completed
              </div>
            )}

            {isHRorAdmin && (
              <button
                onClick={() => setShowManualModal(true)}
                className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl transition"
              >
                Manual Entry
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Filter size={15} />
            <span>Filter records:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Half-Day">Half-Day</option>
            <option value="Absent">Absent</option>
            <option value="On Leave">On Leave</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
          />

          {(statusFilter || dateFilter) && (
            <button
              onClick={() => {
                setStatusFilter('');
                setDateFilter('');
              }}
              className="text-xs text-indigo-600 hover:underline font-medium"
            >
              Reset filters
            </button>
          )}
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing {records.length} attendance logs
        </span>
      </div>

      {/* Attendance Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Clock In</th>
                <th className="py-3.5 px-4">Clock Out</th>
                <th className="py-3.5 px-4">Hours</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    Loading records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No attendance records found matching criteria
                  </td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr key={rec._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center">
                          {rec.employee?.firstName?.[0]}
                          {rec.employee?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {rec.employee?.firstName} {rec.employee?.lastName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {rec.employee?.employeeCode} • {rec.employee?.department?.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{rec.date}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-800">
                      {rec.clockIn ? new Date(rec.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-800">
                      {rec.clockOut ? new Date(rec.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {rec.workHours ? `${rec.workHours} hrs` : '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          rec.status === 'Present'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : rec.status === 'Late'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : rec.status === 'Half-Day'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 italic max-w-xs truncate">
                      {rec.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h2 className="text-base font-bold text-slate-900 mb-1">Manual Attendance Adjustment</h2>
            <p className="text-xs text-slate-500 mb-4">Override or record attendance for an employee.</p>

            <form onSubmit={handleManualSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Employee</label>
                <select
                  value={manualForm.employeeId}
                  onChange={(e) => setManualForm({ ...manualForm, employeeId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={manualForm.date}
                    onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={manualForm.status}
                    onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Present">Present</option>
                    <option value="Late">Late</option>
                    <option value="Half-Day">Half-Day</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Notes / Reason</label>
                <input
                  type="text"
                  value={manualForm.notes}
                  onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
