const express = require('express');
const router = express.Router();
const {
  exportReport,
  getNotifications,
  markNotificationRead,
  getAuditLogs,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/export/:type', exportReport);
router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markNotificationRead);
router.get('/audit-logs', authorize('Admin'), getAuditLogs);

module.exports = router;
