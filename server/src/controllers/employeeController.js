const { z } = require('zod');
const Employee = require('../models/Employee');
const User = require('../models/User');
const Department = require('../models/Department');
const { logAudit } = require('../utils/auditLogger');

const employeeSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    department: z.string().min(1, 'Department is required'),
    designation: z.string().min(1, 'Designation is required'),
    manager: z.string().optional().nullable(),
    employmentType: z.enum(['Full-Time', 'Part-Time', 'Contract', 'Intern']).optional(),
    joiningDate: z.string().optional(),
    salary: z.number().optional(),
    role: z.enum(['Admin', 'HR', 'Manager', 'Employee']).optional(),
    password: z.string().min(6).optional(),
  }),
});

// @desc    Get all employees with pagination, search & filters
// @route   GET /api/employees
const getEmployees = async (req, res) => {
  try {
    const { search, department, status, role, page = 1, limit = 100 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeCode: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
      ];
    }

    if (department) query.department = department;
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const employees = await Employee.find(query)
      .populate('department', 'name code')
      .populate('manager', 'firstName lastName designation email')
      .populate('user', 'role isActive')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Employee.countDocuments(query);

    res.json({
      success: true,
      count: employees.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: employees,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single employee by ID
// @route   GET /api/employees/:id
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department', 'name code')
      .populate('manager', 'firstName lastName designation email')
      .populate('user', 'role isActive');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new employee & associated user account
// @route   POST /api/employees
const createEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      department,
      designation,
      manager,
      employmentType,
      joiningDate,
      salary,
      role = 'Employee',
      password = 'Password123!',
      skills,
      address,
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }

    const deptDoc = await Department.findById(department);
    if (!deptDoc) {
      return res.status(400).json({ success: false, message: 'Invalid department ID' });
    }

    // Auto-generate employee code: e.g., EMP-1001
    const count = await Employee.countDocuments();
    const employeeCode = `EMP-${String(count + 1001).padStart(4, '0')}`;

    // Create User first
    const newUser = await User.create({
      name: `${firstName} ${lastName}`,
      email,
      password,
      role,
    });

    const newEmployee = await Employee.create({
      employeeCode,
      user: newUser._id,
      firstName,
      lastName,
      email,
      phone,
      department,
      designation,
      manager: manager || null,
      employmentType: employmentType || 'Full-Time',
      joiningDate: joiningDate || Date.now(),
      salary: salary || 0,
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s) => s.trim()) : []),
      address,
    });

    // Link user to employee
    newUser.employeeId = newEmployee._id;
    await newUser.save();

    await logAudit({
      user: req.user,
      action: 'EMPLOYEE_CREATED',
      entity: 'Employee',
      entityId: newEmployee._id.toString(),
      details: { employeeCode, email, role },
      req,
    });

    const populated = await Employee.findById(newEmployee._id)
      .populate('department', 'name code')
      .populate('manager', 'firstName lastName designation email')
      .populate('user', 'role isActive');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update employee record
// @route   PUT /api/employees/:id
const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const updates = req.body;
    if (updates.skills && typeof updates.skills === 'string') {
      updates.skills = updates.skills.split(',').map((s) => s.trim());
    }

    Object.assign(employee, updates);
    await employee.save();

    if (updates.role && employee.user) {
      await User.findByIdAndUpdate(employee.user, { role: updates.role });
    }

    await logAudit({
      user: req.user,
      action: 'EMPLOYEE_UPDATED',
      entity: 'Employee',
      entityId: employee._id.toString(),
      details: updates,
      req,
    });

    const updated = await Employee.findById(employee._id)
      .populate('department', 'name code')
      .populate('manager', 'firstName lastName designation email')
      .populate('user', 'role isActive');

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Deactivate employee status
// @route   PATCH /api/employees/:id/status
const updateEmployeeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    employee.status = status;
    await employee.save();

    if (employee.user) {
      await User.findByIdAndUpdate(employee.user, {
        isActive: status === 'Active',
      });
    }

    await logAudit({
      user: req.user,
      action: 'EMPLOYEE_STATUS_CHANGED',
      entity: 'Employee',
      entityId: employee._id.toString(),
      details: { newStatus: status },
      req,
    });

    res.json({ success: true, message: `Status updated to ${status}`, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload profile photo
// @route   POST /api/employees/:id/photo
const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const photoUrl = `/uploads/${req.file.filename}`;
    employee.profilePhoto = photoUrl;
    await employee.save();

    res.json({ success: true, photoUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  uploadProfilePhoto,
  employeeSchema,
};
