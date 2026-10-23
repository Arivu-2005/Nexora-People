const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

// Helper to format as CSV
const toCSV = (fields, data) => {
  const header = fields.map((f) => `"${f.label}"`).join(',');
  const rows = data.map((row) => {
    return fields
      .map((f) => {
        let val = f.getter ? f.getter(row) : row[f.key];
        if (val === undefined || val === null) val = '';
        val = String(val).replace(/"/g, '""');
        return `"${val}"`;
      })
      .join(',');
  });
  return [header, ...rows].join('\n');
};

// @desc    Export data in CSV format
// @route   GET /api/reports/export/:type
const exportReport = async (req, res) => {
  try {
    const { type } = req.params; // 'employees', 'attendance', 'leaves', 'performance'
    let filename = `report_${type}_${Date.now()}.csv`;
    let csvContent = '';

    if (type === 'employees') {
      const records = await Employee.find().populate('department', 'name code').populate('manager', 'firstName lastName');
      const fields = [
        { label: 'Employee Code', key: 'employeeCode' },
        { label: 'First Name', key: 'firstName' },
        { label: 'Last Name', key: 'lastName' },
        { label: 'Email', key: 'email' },
        { label: 'Phone', key: 'phone' },
        { label: 'Department', getter: (r) => (r.department ? r.department.name : '') },
        { label: 'Designation', key: 'designation' },
        { label: 'Employment Type', key: 'employmentType' },
        { label: 'Status', key: 'status' },
        { label: 'Joining Date', getter: (r) => (r.joiningDate ? new Date(r.joiningDate).toISOString().split('T')[0] : '') },
        { label: 'Salary', key: 'salary' },
      ];
      csvContent = toCSV(fields, records);
    } else if (type === 'attendance') {
      const records = await Attendance.find().populate('employee', 'firstName lastName employeeCode');
      const fields = [
        { label: 'Date', key: 'date' },
        { label: 'Employee Code', getter: (r) => (r.employee ? r.employee.employeeCode : '') },
        { label: 'Name', getter: (r) => (r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : '') },
        { label: 'Status', key: 'status' },
        { label: 'Clock In', getter: (r) => (r.clockIn ? new Date(r.clockIn).toLocaleTimeString() : '') },
        { label: 'Clock Out', getter: (r) => (r.clockOut ? new Date(r.clockOut).toLocaleTimeString() : '') },
        { label: 'Work Hours', key: 'workHours' },
      ];
      csvContent = toCSV(fields, records);
    } else if (type === 'leaves') {
      const records = await LeaveRequest.find().populate('employee', 'firstName lastName employeeCode');
      const fields = [
        { label: 'Employee Code', getter: (r) => (r.employee ? r.employee.employeeCode : '') },
        { label: 'Name', getter: (r) => (r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : '') },
        { label: 'Leave Type', key: 'leaveType' },
        { label: 'Start Date', getter: (r) => (r.startDate ? new Date(r.startDate).toISOString().split('T')[0] : '') },
        { label: 'End Date', getter: (r) => (r.endDate ? new Date(r.endDate).toISOString().split('T')[0] : '') },
        { label: 'Total Days', key: 'totalDays' },
        { label: 'Status', key: 'status' },
        { label: 'Reason', key: 'reason' },
      ];
      csvContent = toCSV(fields, records);
    } else if (type === 'performance') {
      const records = await Review.find().populate('employee', 'firstName lastName employeeCode designation').populate('reviewer', 'name');
      const fields = [
        { label: 'Employee Code', getter: (r) => (r.employee ? r.employee.employeeCode : '') },
        { label: 'Name', getter: (r) => (r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : '') },
        { label: 'Review Cycle', key: 'cycle' },
        { label: 'Reviewer', getter: (r) => (r.reviewer ? r.reviewer.name : '') },
        { label: 'Overall Rating', getter: (r) => (r.ratings ? r.ratings.overallRating : '') },
        { label: 'Feedback', key: 'feedback' },
      ];
      csvContent = toCSV(fields, records);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid report type' });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user notifications
// @route   GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.json({ success: true, count: notifications.length, unreadCount, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
const markNotificationRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get audit logs (Admin only)
// @route   GET /api/reports/audit-logs
const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  exportReport,
  getNotifications,
  markNotificationRead,
  getAuditLogs,
};
