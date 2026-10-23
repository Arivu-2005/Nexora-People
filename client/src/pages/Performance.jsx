import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Target,
  Award,
  Star,
  CheckCircle,
  PlusCircle,
  TrendingUp,
  User,
  Sliders,
  Calendar,
} from 'lucide-react';

const Performance = () => {
  const { user } = useAuth();
  const canReview = ['Admin', 'HR', 'Manager'].includes(user?.role);

  const [activeTab, setActiveTab] = useState('goals'); // 'goals' | 'reviews'
  const [goals, setGoals] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Goal Modal
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalForm, setGoalForm] = useState({
    employee: '',
    title: '',
    description: '',
    category: 'Productivity',
    targetDate: '',
    weightage: 25,
    metricsKPI: { metricName: 'Sprint Delivery', targetValue: '100%', currentValue: '0%' },
  });

  // Review Modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    employee: '',
    cycle: 'Q1 2026',
    ratings: {
      technicalSkills: 4.5,
      communication: 4.0,
      teamwork: 4.5,
      punctuality: 4.0,
      leadership: 4.0,
      overallRating: 4.2,
    },
    strengths: '',
    areasOfImprovement: '',
    feedback: '',
  });

  useEffect(() => {
    fetchGoals();
    fetchReviews();
    if (canReview) fetchEmployees();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/performance/goals');
      setGoals(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get('/performance/reviews');
      setReviews(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      setEmployees(res.data.data || []);
      if (res.data.data?.length > 0) {
        setGoalForm((prev) => ({ ...prev, employee: res.data.data[0]._id }));
        setReviewForm((prev) => ({ ...prev, employee: res.data.data[0]._id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      await api.post('/performance/goals', goalForm);
      setShowGoalModal(false);
      fetchGoals();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating goal');
    }
  };

  const handleUpdateProgress = async (id, currentProgress) => {
    const nextVal = prompt('Enter new goal completion percentage (0 - 100):', currentProgress);
    if (nextVal !== null) {
      const num = Number(nextVal);
      if (isNaN(num) || num < 0 || num > 100) return alert('Please enter a valid percentage between 0 and 100');
      try {
        await api.patch(`/performance/goals/${id}/progress`, { progress: num });
        fetchGoals();
      } catch (err) {
        alert(err.response?.data?.message || 'Error updating progress');
      }
    }
  };

  const handleCreateReview = async (e) => {
    e.preventDefault();
    try {
      await api.post('/performance/reviews', reviewForm);
      setShowReviewModal(false);
      fetchReviews();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating performance review');
    }
  };

  return (
    <div className="space-y-6">
      {/* Performance Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Performance & KPI Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Set quarterly goals, measure employee KPIs, and publish official appraisal reviews.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGoalModal(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <PlusCircle size={15} />
            Add Strategic Goal
          </button>
          {canReview && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-100 transition"
            >
              <Award size={15} />
              Log Review / Appraisal
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('goals')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'goals'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Target size={15} />
          Active Goals & KPIs ({goals.length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'reviews'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Star size={15} />
          Performance Reviews ({reviews.length})
        </button>
      </div>

      {/* Tab: Goals Grid */}
      {activeTab === 'goals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-3 py-16 text-center text-slate-400">Loading goals...</div>
          ) : goals.length === 0 ? (
            <div className="col-span-3 bg-white rounded-2xl p-12 text-center border border-slate-200">
              <Target size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No goals found</p>
              <p className="text-xs text-slate-400 mt-1">Start by assigning strategic objectives and KPIs.</p>
            </div>
          ) : (
            goals.map((g) => (
              <div
                key={g._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                      {g.category}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        g.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {g.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{g.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{g.description}</p>

                  {/* KPI metric pill if exists */}
                  {g.metricsKPI?.metricName && (
                    <div className="mt-3 p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-600 flex justify-between items-center">
                      <span className="font-medium">{g.metricsKPI.metricName}:</span>
                      <span className="font-bold text-indigo-600">
                        {g.metricsKPI.currentValue} / {g.metricsKPI.targetValue}
                      </span>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-600">Progress</span>
                      <span className="font-extrabold text-indigo-600">{g.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${g.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">
                    Owner: <strong>{g.employee?.firstName} {g.employee?.lastName}</strong>
                  </span>
                  <button
                    onClick={() => handleUpdateProgress(g._id, g.progress)}
                    className="text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    Update Progress
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Reviews Grid */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <Star size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No performance reviews recorded yet</p>
            </div>
          ) : (
            reviews.map((r) => (
              <div
                key={r._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row gap-6 justify-between"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                      {r.cycle}
                    </span>
                    <span className="text-xs text-slate-400">
                      Evaluated on {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    Review for {r.employee?.firstName} {r.employee?.lastName} ({r.employee?.designation})
                  </h3>

                  <div className="text-xs text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="font-semibold text-slate-700 mb-1">Executive Feedback:</p>
                    <p className="italic">"{r.feedback}"</p>
                  </div>

                  {r.strengths && (
                    <p className="text-xs text-slate-600">
                      <strong>Strengths:</strong> {r.strengths}
                    </p>
                  )}
                </div>

                {/* Ratings Breakdown Card */}
                <div className="w-full md:w-64 bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-600">Overall Rating</span>
                      <div className="flex items-center gap-1 text-amber-500 font-extrabold text-sm">
                        <Star size={14} className="fill-amber-400" />
                        <span>{r.ratings?.overallRating || 4.0} / 5.0</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-slate-600">
                      <div className="flex justify-between">
                        <span>Technical Skills:</span>
                        <span className="font-bold">{r.ratings?.technicalSkills || 4}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Communication:</span>
                        <span className="font-bold">{r.ratings?.communication || 4}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Teamwork:</span>
                        <span className="font-bold">{r.ratings?.teamwork || 4}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Leadership:</span>
                        <span className="font-bold">{r.ratings?.leadership || 4}/5</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-200">
                    Reviewer: {r.reviewer?.name} ({r.reviewer?.role})
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h2 className="text-base font-bold text-slate-900 mb-1">Set Strategic Goal & KPI</h2>
            <p className="text-xs text-slate-500 mb-4">Establish milestone targets and metrics for performance.</p>

            <form onSubmit={handleCreateGoal} className="space-y-3.5">
              {canReview && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Assignee</label>
                  <select
                    value={goalForm.employee}
                    onChange={(e) => setGoalForm({ ...goalForm, employee: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.firstName} {emp.lastName} ({emp.designation})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modernize frontend deployment CI/CD"
                  value={goalForm.title}
                  onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={goalForm.category}
                    onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Productivity">Productivity</option>
                    <option value="Quality">Quality</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Strategic Project">Strategic Project</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Date</label>
                  <input
                    type="date"
                    required
                    value={goalForm.targetDate}
                    onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={goalForm.description}
                  onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h2 className="text-base font-bold text-slate-900 mb-1">Submit Performance Review</h2>
            <p className="text-xs text-slate-500 mb-4">Complete cycle evaluation and 360 feedback.</p>

            <form onSubmit={handleCreateReview} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Employee</label>
                  <select
                    value={reviewForm.employee}
                    onChange={(e) => setReviewForm({ ...reviewForm, employee: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cycle</label>
                  <input
                    type="text"
                    value={reviewForm.cycle}
                    onChange={(e) => setReviewForm({ ...reviewForm, cycle: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Overall Rating (1 - 5)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  required
                  value={reviewForm.ratings.overallRating}
                  onChange={(e) =>
                    setReviewForm({
                      ...reviewForm,
                      ratings: { ...reviewForm.ratings, overallRating: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Key Strengths</label>
                <input
                  type="text"
                  placeholder="e.g. Exceptional teamwork and architecture leadership"
                  value={reviewForm.strengths}
                  onChange={(e) => setReviewForm({ ...reviewForm, strengths: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Manager Feedback & Appraisal</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Detailed observations and performance trajectory..."
                  value={reviewForm.feedback}
                  onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Performance;
