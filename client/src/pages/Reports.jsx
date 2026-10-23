import React, { useState } from 'react';
import api from '../services/api';
import {
  FileSpreadsheet,
  Download,
  FileText,
  Users,
  Clock,
  CalendarCheck,
  Star,
  CheckCircle2,
} from 'lucide-react';

const Reports = () => {
  const [downloading, setDownloading] = useState(null);

  const handleDownload = async (type) => {
    try {
      setDownloading(type);
      const res = await api.get(`/reports/export/${type}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `peoplepulse_${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Error exporting report. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const reportCards = [
    {
      id: 'employees',
      title: 'Workforce Master Registry',
      desc: 'Complete employee census with designations, salaries, departments, joining dates, and contact info.',
      icon: Users,
      color: 'from-blue-600 to-indigo-600',
    },
    {
      id: 'attendance',
      title: 'Attendance & Clock-In Log',
      desc: 'Daily timestamps, working hours calculation, punctuality status (Present/Late/Half-Day).',
      icon: Clock,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'leaves',
      title: 'Leave Applications & Quota Audit',
      desc: 'All historical time-off applications, approval states, balances, and manager authorizations.',
      icon: CalendarCheck,
      color: 'from-amber-500 to-orange-500',
    },
    {
      id: 'performance',
      title: 'Appraisal Reviews & Rating Matrix',
      desc: 'Quarterly review outcomes, KPI metric achievements, executive feedback, and scoring averages.',
      icon: Star,
      color: 'from-violet-600 to-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          HR Reports & Data Export Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Generate compliant CSV database snapshots for payroll, audits, compliance, and leadership meetings.
        </p>
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reportCards.map((r) => {
          const Icon = r.icon;
          const isBusy = downloading === r.id;
          return (
            <div
              key={r.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-3 rounded-2xl bg-gradient-to-tr ${r.color} text-white shadow-md`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{r.title}</h3>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      CSV Ready
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{r.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Export format: .CSV</span>
                <button
                  onClick={() => handleDownload(r.id)}
                  disabled={isBusy}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-100 transition"
                >
                  <Download size={14} />
                  {isBusy ? 'Generating Export...' : 'Download Report'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Reports;
