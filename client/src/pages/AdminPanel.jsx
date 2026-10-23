import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  History,
  Lock,
  Users,
  Settings,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

const AdminPanel = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/audit-logs');
      setLogs(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-xl bg-purple-50 text-purple-600">
            <ShieldCheck size={16} />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Security & Governance</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Admin Governance & Security Audit Logs
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Immutable event log of system operations, user logins, leave decisions, and record updates.
        </p>
      </div>

      {/* System Policy Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Authentication Policy</p>
          <p className="text-base font-bold text-slate-900 mt-1">JWT + Bcrypt (Salt: 10)</p>
          <span className="inline-block mt-2 text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-semibold">
            Token Expiry: 7 Days
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Access Control Mode</p>
          <p className="text-base font-bold text-slate-900 mt-1">RBAC Enforced</p>
          <span className="inline-block mt-2 text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-semibold">
            Admin / HR / Manager / Employee
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Database Storage</p>
          <p className="text-base font-bold text-slate-900 mt-1">MongoDB Atlas / Mongoose</p>
          <span className="inline-block mt-2 text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-semibold">
            Persistent Collections & Indexes
          </span>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History size={16} className="text-slate-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Audit Trail Events</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Live Logs: {logs.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    No audit records recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {log.user ? `${log.user.name} (${log.user.role})` : 'System Task'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{log.entity}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[10px] max-w-sm truncate">
                      {JSON.stringify(log.details) || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
