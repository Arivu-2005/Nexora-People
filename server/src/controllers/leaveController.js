const LeaveRequest = require('../models/LeaveRequest');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');
const { logAudit } = require('../utils/auditLogger');

// @desc    Apply for leave
// @route   POST /api/leaves
const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, totalDays, reason } = req.body;
    const employeeId = req.user.employeeId ? req.user.employeeId._id : req.body.employeeId;

    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'Employee reference is required' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Check balance
    const typeKey = leaveType.toLowerCase();
    if (employee.leaveBalances && employee.leaveBalances[typeKey] !== undefined) {
      if (employee.leaveBalances[typeKey] < totalDays) {
        return res.status(400).json({
          success: false,
          message: `Insufficient ${leaveType} leave balance. Available: ${employee.leaveBalances[typeKey]}, Requested: ${totalDays}`,
        });
      }
    }

    const leaveRequest = await LeaveRequest.create({
      employee: employeeId,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
      status: 'Pending',
    });

    // Notify Admins and Managers
    await Notification.create({
      recipient: employee.manager || req.user._id,
      sender: req.user._id,
      title: 'New Leave Request',
      message: `${employee.firstName} ${employee.lastName} requested ${totalDays} days of ${leaveType} leave.`,
      type: 'Leave',
      link: '/leaves',
    });

    await logAudit({
      user: req.user,
      action: 'LEAVE_APPLIED',
      entity: 'LeaveRequest',
      entityId: leaveRequest._id.toString(),
      details: { leaveType, totalDays, startDate, endDate },
      req,
    });

    res.status(201).json({ success: true, data: leaveRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all leave requests (filtered by role or employee)
// @route   GET /api/leaves
const getLeaves = async (req, res) => {
  try {
    const { status, employeeId, leaveType } = req.query;
    const query = {};

    if (req.user.role === 'Employee') {
      if (req.user.employeeId) {
        query.employee = req.user.employeeId._id;
      }
    } else if (employeeId) {
      query.employee = employeeId;
    }

    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;

    const leaves = await LeaveRequest.find(query)
      .populate({
        path: 'employee',
        select: 'firstName lastName employeeCode designation department profilePhoto leaveBalances',
        populate: { path: 'department', select: 'name code' },
      })
      .populate('approvedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: leaves.length, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve or Reject leave request
// @route   PATCH /api/leaves/:id/status
const updateLeaveStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Approved or Rejected' });
    }

    const leave = await LeaveRequest.findById(req.params.id).populate('employee');
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    leave.status = status;
    leave.approvedBy = req.user._id;
    leave.actionDate = new Date();
    if (status === 'Rejected') {
      leave.rejectionReason = rejectionReason || 'Request was not approved by HR/Manager';
    } else if (status === 'Approved') {
      // Deduct balance
      const emp = await Employee.findById(leave.employee._id);
      const typeKey = leave.leaveType.toLowerCase();
      if (emp && emp.leaveBalances && emp.leaveBalances[typeKey] !== undefined) {
        emp.leaveBalances[typeKey] = Math.max(0, emp.leaveBalances[typeKey] - leave.totalDays);
        await emp.save();
      }
    }

    await leave.save();

    // Notify employee
    if (leave.employee && leave.employee.user) {
      await Notification.create({
        recipient: leave.employee.user,
        sender: req.user._id,
        title: `Leave Request ${status}`,
        message: `Your leave request for ${leave.leaveType} (${leave.totalDays} days) has been ${status.toLowerCase()}.`,
        type: 'Leave',
        link: '/leaves',
      });
    }

    await logAudit({
      user: req.user,
      action: `LEAVE_${status.toUpperCase()}`,
      entity: 'LeaveRequest',
      entityId: leave._id.toString(),
      details: { status, rejectionReason },
      req,
    });

    res.json({ success: true, message: `Leave marked as ${status}`, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  applyLeave,
  getLeaves,
  updateLeaveStatus,
};
