const express = require('express');
const router = express.Router();
const {
  createGoal,
  getGoals,
  updateGoalProgress,
  createReview,
  getReviews,
} = require('../controllers/performanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/goals', createGoal);
router.get('/goals', getGoals);
router.patch('/goals/:id/progress', updateGoalProgress);

router.post('/reviews', authorize('Admin', 'HR', 'Manager'), createReview);
router.get('/reviews', getReviews);

module.exports = router;
