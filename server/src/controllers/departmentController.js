const Department = require('../models/Department');
const Employee = require('../models/Employee');
const { logAudit } = require('../utils/auditLogger');

// @desc    Get all departments with member count
// @route   GET /api/departments
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().populate('head', 'firstName lastName email designation');

    // Attach real counts from database
    const departmentsWithStats = await Promise.all(
      departments.map(async (dept) => {
        const count = await Employee.countDocuments({ department: dept._id });
        return {
          ...dept.toObject(),
          employeeCount: count,
        };
      })
    );

    res.json({ success: true, count: departmentsWithStats.length, data: departmentsWithStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create department
// @route   POST /api/departments
const createDepartment = async (req, res) => {
  try {
    const { name, code, description, head, budget, location } = req.body;

    const exists = await Department.findOne({ $or: [{ name }, { code }] });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Department with this name or code already exists' });
    }

    const dept = await Department.create({
      name,
      code,
      description,
      head: head || null,
      budget: budget || 0,
      location: location || 'Main Headquarters',
    });

    await logAudit({
      user: req.user,
      action: 'DEPARTMENT_CREATED',
      entity: 'Department',
      entityId: dept._id.toString(),
      details: { name, code },
      req,
    });

    res.status(201).json({ success: true, data: dept });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
const updateDepartment = async (req, res) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('head', 'firstName lastName email designation');

    if (!dept) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    res.json({ success: true, data: dept });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
const deleteDepartment = async (req, res) => {
  try {
    const employeesCount = await Employee.countDocuments({ department: req.params.id });
    if (employeesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department. There are ${employeesCount} employees assigned to it.`,
      });
    }

    await Department.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
