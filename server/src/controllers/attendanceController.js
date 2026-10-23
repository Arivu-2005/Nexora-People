const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { logAudit } = require('../utils/auditLogger');

// Format date helper: YYYY-MM-DD
const getTodayDateStr = () => new Date().toISOString().split('T')[0];

// @desc    Clock in
// @route   POST /api/attendance/clock-in
const clockIn = async (req, res) => {
  try {
    const userEmployee = req.user.employeeId;
    if (!userEmployee) {
      return res.status(400).json({ success: false, message: 'Current user has no associated employee profile' });
    }

    const today = getTodayDateStr();
    let record = await Attendance.findOne({ employee: userEmployee._id, date: today });

    if (record && record.clockIn) {
      return res.status(400).json({ success: false, message: 'You have already clocked in today', record });
    }

    const now = new Date();
    // Check if late (after 9:30 AM)
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const isLate = hours > 9 || (hours === 9 && minutes > 30);

    if (!record) {
      record = new Attendance({
        employee: userEmployee._id,
        date: today,
        clockIn: now,
        status: isLate ? 'Late' : 'Present',
        ipAddress: req.ip,
      });
    } else {
      record.clockIn = now;
      record.status = isLate ? 'Late' : 'Present';
    }

    await record.save();

    await logAudit({
      user: req.user,
      action: 'CLOCK_IN',
      entity: 'Attendance',
      entityId: record._id.toString(),
      details: { time: now, status: record.status },
      req,
    });

    res.json({ success: true, message: 'Clocked in successfully', data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clock out
// @route   POST /api/attendance/clock-out
const clockOut = async (req, res) => {
  try {
    const userEmployee = req.user.employeeId;
    if (!userEmployee) {
      return res.status(400).json({ success: false, message: 'No associated employee profile' });
    }

    const today = getTodayDateStr();
    const record = await Attendance.findOne({ employee: userEmployee._id, date: today });

    if (!record || !record.clockIn) {
      return res.status(400).json({ success: false, message: 'You have not clocked in yet today' });
    }

    if (record.clockOut) {
      return res.status(400).json({ success: false, message: 'You have already clocked out today', record });
    }

    const now = new Date();
    record.clockOut = now;

    // Calculate hours
    const diffMs = now - record.clockIn;
    const diffHrs = (diffMs / (1000 * 60 * 60)).toFixed(2);
    record.workHours = parseFloat(diffHrs);

    if (record.workHours < 4) {
      record.status = 'Half-Day';
    }

    await record.save();

    await logAudit({
      user: req.user,
      action: 'CLOCK_OUT',
      entity: 'Attendance',
      entityId: record._id.toString(),
      details: { time: now, workHours: record.workHours },
      req,
    });

    res.json({ success: true, message: 'Clocked out successfully', data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get attendance status for today
// @route   GET /api/attendance/today-status
const getTodayStatus = async (req, res) => {
  try {
    const userEmployee = req.user.employeeId;
    if (!userEmployee) {
      return res.json({ success: true, data: null });
    }

    const today = getTodayDateStr();
    const record = await Attendance.findOne({ employee: userEmployee._id, date: today });

    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get attendance history with filters
// @route   GET /api/attendance
const getAttendanceRecords = async (req, res) => {
  try {
    const { employeeId, department, date, startDate, endDate, status } = req.query;
    const query = {};

    if (req.user.role === 'Employee') {
      if (req.user.employeeId) {
        query.employee = req.user.employeeId._id;
      }
    } else if (employeeId) {
      query.employee = employeeId;
    }

    if (date) query.date = date;
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }
    if (status) query.status = status;

    let records = await Attendance.find(query)
      .populate({
        path: 'employee',
        select: 'firstName lastName employeeCode designation department profilePhoto',
        populate: { path: 'department', select: 'name code' },
      })
      .sort({ date: -1, clockIn: -1 })
      .limit(200);

    // Filter by department if requested
    if (department) {
      records = records.filter(
        (r) => r.employee && r.employee.department && r.employee.department._id.toString() === department
      );
    }

    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin/HR manual mark attendance
// @route   POST /api/attendance/manual
const markManualAttendance = async (req, res) => {
  try {
    const { employeeId, date, status, clockIn, clockOut, notes } = req.body;

    const emp = await Employee.findById(employeeId);
    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });

    let record = await Attendance.findOne({ employee: employeeId, date });
    if (!record) {
      record = new Attendance({ employee: employeeId, date });
    }

    record.status = status || 'Present';
    if (clockIn) record.clockIn = new Date(clockIn);
    if (clockOut) record.clockOut = new Date(clockOut);
    if (clockIn && clockOut) {
      const diffHrs = ((new Date(clockOut) - new Date(clockIn)) / (1000 * 60 * 60)).toFixed(2);
      record.workHours = parseFloat(diffHrs);
    }
    record.notes = notes || 'Manually adjusted by HR';

    await record.save();

    res.json({ success: true, message: 'Attendance updated manually', data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  clockIn,
  clockOut,
  getTodayStatus,
  getAttendanceRecords,
  markManualAttendance,
};
