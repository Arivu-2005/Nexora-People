const Goal = require('../models/Goal');
const Review = require('../models/Review');
const Employee = require('../models/Employee');
const { logAudit } = require('../utils/auditLogger');

// --- GOALS ---

const createGoal = async (req, res) => {
  try {
    const { employee, title, description, category, targetDate, weightage, metricsKPI } = req.body;
    const targetEmployee = employee || (req.user.employeeId ? req.user.employeeId._id : null);

    if (!targetEmployee) {
      return res.status(400).json({ success: false, message: 'Employee target is required' });
    }

    const goal = await Goal.create({
      employee: targetEmployee,
      title,
      description,
      category,
      targetDate,
      weightage,
      metricsKPI,
      createdBy: req.user._id,
    });

    await logAudit({
      user: req.user,
      action: 'GOAL_CREATED',
      entity: 'Goal',
      entityId: goal._id.toString(),
      details: { title, targetEmployee },
      req,
    });

    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getGoals = async (req, res) => {
  try {
    const { employeeId, status, category } = req.query;
    const query = {};

    if (req.user.role === 'Employee') {
      if (req.user.employeeId) query.employee = req.user.employeeId._id;
    } else if (employeeId) {
      query.employee = employeeId;
    }

    if (status) query.status = status;
    if (category) query.category = category;

    const goals = await Goal.find(query)
      .populate('employee', 'firstName lastName employeeCode designation department')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: goals.length, data: goals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateGoalProgress = async (req, res) => {
  try {
    const { progress, status, metricsKPI } = req.body;
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    if (progress !== undefined) goal.progress = Number(progress);
    if (status) goal.status = status;
    if (metricsKPI) goal.metricsKPI = { ...goal.metricsKPI, ...metricsKPI };

    if (goal.progress >= 100) {
      goal.status = 'Completed';
    }

    await goal.save();
    res.json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- REVIEWS ---

const createReview = async (req, res) => {
  try {
    const { employee, cycle, ratings, strengths, areasOfImprovement, feedback } = req.body;

    const overallRating =
      ratings && ratings.overallRating
        ? ratings.overallRating
        : ratings
        ? (
            (Number(ratings.technicalSkills || 4) +
              Number(ratings.communication || 4) +
              Number(ratings.teamwork || 4) +
              Number(ratings.punctuality || 4) +
              Number(ratings.leadership || 4)) /
            5
          ).toFixed(1)
        : 4.0;

    const review = await Review.create({
      employee,
      reviewer: req.user._id,
      cycle: cycle || 'Annual 2026',
      ratings: {
        ...ratings,
        overallRating: Number(overallRating),
      },
      strengths,
      areasOfImprovement,
      feedback,
      status: 'Submitted',
    });

    await logAudit({
      user: req.user,
      action: 'PERFORMANCE_REVIEW_SUBMITTED',
      entity: 'Review',
      entityId: review._id.toString(),
      details: { employee, overallRating },
      req,
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getReviews = async (req, res) => {
  try {
    const { employeeId, cycle } = req.query;
    const query = {};

    if (req.user.role === 'Employee') {
      if (req.user.employeeId) query.employee = req.user.employeeId._id;
    } else if (employeeId) {
      query.employee = employeeId;
    }

    if (cycle) query.cycle = cycle;

    const reviews = await Review.find(query)
      .populate('employee', 'firstName lastName employeeCode designation department')
      .populate('reviewer', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createGoal,
  getGoals,
  updateGoalProgress,
  createReview,
  getReviews,
};
