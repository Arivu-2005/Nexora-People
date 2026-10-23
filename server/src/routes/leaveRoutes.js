const express = require('express');
const router = express.Router();
const { applyLeave, getLeaves, updateLeaveStatus } = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .post(applyLeave)
  .get(getLeaves);

router.patch('/:id/status', authorize('Admin', 'HR', 'Manager'), updateLeaveStatus);

module.exports = router;
