const express = require('express');
const router = express.Router();
const {
  clockIn,
  clockOut,
  getTodayStatus,
  getAttendanceRecords,
  markManualAttendance,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.get('/today-status', getTodayStatus);
router.get('/', getAttendanceRecords);
router.post('/manual', authorize('Admin', 'HR'), markManualAttendance);

module.exports = router;
