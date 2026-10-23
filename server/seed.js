require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Department = require('./src/models/Department');
const Employee = require('./src/models/Employee');
const Attendance = require('./src/models/Attendance');
const LeaveRequest = require('./src/models/LeaveRequest');
const Goal = require('./src/models/Goal');
const Review = require('./src/models/Review');
const Notification = require('./src/models/Notification');
const AuditLog = require('./src/models/AuditLog');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/peoplepulse_hr';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear collections
    await User.deleteMany({});
    await Department.deleteMany({});
    await Employee.deleteMany({});
    await Attendance.deleteMany({});
    await LeaveRequest.deleteMany({});
    await Goal.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});

    console.log('Cleared existing data.');

    // 1. Departments
    const engineering = await Department.create({
      name: 'Engineering',
      code: 'ENG',
      description: 'Product development, platform architecture, and cloud operations',
      budget: 1200000,
      location: 'Building A, 4th Floor',
    });

    const hrDept = await Department.create({
      name: 'Human Resources',
      code: 'HRD',
      description: 'People operations, talent acquisition, culture, and employee welfare',
      budget: 450000,
      location: 'Building B, 2nd Floor',
    });

    const salesDept = await Department.create({
      name: 'Sales & Growth',
      code: 'SAL',
      description: 'Global business development, enterprise partnerships, and client success',
      budget: 800000,
      location: 'Building A, 2nd Floor',
    });

    const productDept = await Department.create({
      name: 'Product & Design',
      code: 'PRD',
      description: 'UI/UX design, user research, product strategy and roadmaps',
      budget: 600000,
      location: 'Building C, 3rd Floor',
    });

    // 2. Users and Employees
    // Admin User
    const adminUser = await User.create({
      name: 'Sarah Connor',
      email: 'admin@peoplepulse.com',
      password: 'Password123!',
      role: 'Admin',
      isActive: true,
    });

    const adminEmp = await Employee.create({
      employeeCode: 'EMP-1001',
      user: adminUser._id,
      firstName: 'Sarah',
      lastName: 'Connor',
      email: 'admin@peoplepulse.com',
      phone: '+1 (555) 234-5678',
      department: hrDept._id,
      designation: 'VP of People & Culture',
      employmentType: 'Full-Time',
      status: 'Active',
      salary: 135000,
      skills: ['Leadership', 'Strategic Planning', 'Talent Retention', 'Compensation'],
    });
    adminUser.employeeId = adminEmp._id;
    await adminUser.save();
    hrDept.head = adminEmp._id;
    await hrDept.save();

    // HR Specialist User
    const hrUser = await User.create({
      name: 'Marcus Vance',
      email: 'hr@peoplepulse.com',
      password: 'Password123!',
      role: 'HR',
      isActive: true,
    });

    const hrEmp = await Employee.create({
      employeeCode: 'EMP-1002',
      user: hrUser._id,
      firstName: 'Marcus',
      lastName: 'Vance',
      email: 'hr@peoplepulse.com',
      phone: '+1 (555) 345-6789',
      department: hrDept._id,
      designation: 'Senior HR Manager',
      manager: adminEmp._id,
      employmentType: 'Full-Time',
      status: 'Active',
      salary: 92000,
      skills: ['Recruitment', 'Conflict Resolution', 'Employee Relations'],
    });
    hrUser.employeeId = hrEmp._id;
    await hrUser.save();

    // Engineering Manager
    const mgrUser = await User.create({
      name: 'Elena Rostova',
      email: 'manager@peoplepulse.com',
      password: 'Password123!',
      role: 'Manager',
      isActive: true,
    });

    const mgrEmp = await Employee.create({
      employeeCode: 'EMP-1003',
      user: mgrUser._id,
      firstName: 'Elena',
      lastName: 'Rostova',
      email: 'manager@peoplepulse.com',
      phone: '+1 (555) 456-7890',
      department: engineering._id,
      designation: 'Engineering Director',
      employmentType: 'Full-Time',
      status: 'Active',
      salary: 145000,
      skills: ['Distributed Systems', 'Go', 'React', 'Agile Coaching'],
    });
    mgrUser.employeeId = mgrEmp._id;
    await mgrUser.save();
    engineering.head = mgrEmp._id;
    await engineering.save();

    // Regular Employee 1
    const devUser = await User.create({
      name: 'David Kim',
      email: 'employee@peoplepulse.com',
      password: 'Password123!',
      role: 'Employee',
      isActive: true,
    });

    const devEmp = await Employee.create({
      employeeCode: 'EMP-1004',
      user: devUser._id,
      firstName: 'David',
      lastName: 'Kim',
      email: 'employee@peoplepulse.com',
      phone: '+1 (555) 567-8901',
      department: engineering._id,
      designation: 'Senior Full Stack Engineer',
      manager: mgrEmp._id,
      employmentType: 'Full-Time',
      status: 'Active',
      salary: 115000,
      skills: ['Node.js', 'React', 'TypeScript', 'MongoDB', 'Docker'],
      leaveBalances: { annual: 16, casual: 10, sick: 9 },
    });
    devUser.employeeId = devEmp._id;
    await devUser.save();

    // Regular Employee 2
    const devUser2 = await User.create({
      name: 'Sophia Patel',
      email: 'sophia@peoplepulse.com',
      password: 'Password123!',
      role: 'Employee',
      isActive: true,
    });

    const devEmp2 = await Employee.create({
      employeeCode: 'EMP-1005',
      user: devUser2._id,
      firstName: 'Sophia',
      lastName: 'Patel',
      email: 'sophia@peoplepulse.com',
      phone: '+1 (555) 678-9012',
      department: productDept._id,
      designation: 'Lead Product Designer',
      manager: adminEmp._id,
      employmentType: 'Full-Time',
      status: 'Active',
      salary: 108000,
      skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping'],
      leaveBalances: { annual: 14, casual: 8, sick: 10 },
    });
    devUser2.employeeId = devEmp2._id;
    await devUser2.save();

    // 3. Attendance for today & recent days
    const today = new Date().toISOString().split('T')[0];

    await Attendance.create({
      employee: devEmp._id,
      date: today,
      clockIn: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      status: 'Present',
      workHours: 4.0,
      notes: 'On track with sprint deliveries',
    });

    await Attendance.create({
      employee: adminEmp._id,
      date: today,
      clockIn: new Date(Date.now() - 5 * 60 * 60 * 1000),
      status: 'Present',
      workHours: 5.0,
    });

    await Attendance.create({
      employee: mgrEmp._id,
      date: today,
      clockIn: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
      status: 'Present',
      workHours: 3.5,
    });

    // 4. Leave Requests
    await LeaveRequest.create({
      employee: devEmp._id,
      leaveType: 'Annual',
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      totalDays: 2,
      reason: 'Family reunion and planned vacation trip.',
      status: 'Pending',
    });

    await LeaveRequest.create({
      employee: devEmp2._id,
      leaveType: 'Casual',
      startDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      totalDays: 1,
      reason: 'Personal urgent appointment.',
      status: 'Approved',
      approvedBy: adminUser._id,
      actionDate: new Date(),
    });

    // 5. Goals
    await Goal.create({
      employee: devEmp._id,
      title: 'Upgrade Enterprise Core to Microservices Architecture',
      description: 'Refactor monolith authentication & reporting workflows into scalable docker services.',
      category: 'Strategic Project',
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'In Progress',
      progress: 68,
      weightage: 40,
      metricsKPI: {
        metricName: 'API Latency reduction',
        targetValue: '< 50ms',
        currentValue: '65ms',
      },
      createdBy: mgrUser._id,
    });

    await Goal.create({
      employee: devEmp._id,
      title: 'Mentorship of Junior Frontend Apprentices',
      description: 'Conduct bi-weekly code reviews and architecture pair programming sessions.',
      category: 'Leadership',
      targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      status: 'In Progress',
      progress: 85,
      weightage: 30,
      metricsKPI: {
        metricName: 'Mentees project completion',
        targetValue: '2 cohorts',
        currentValue: '1 cohort complete',
      },
      createdBy: mgrUser._id,
    });

    // 6. Review
    await Review.create({
      employee: devEmp._id,
      reviewer: mgrUser._id,
      cycle: 'Q1 2026',
      ratings: {
        technicalSkills: 5,
        communication: 4,
        teamwork: 5,
        punctuality: 4.8,
        leadership: 4.5,
        overallRating: 4.7,
      },
      strengths: 'Outstanding problem-solving capability, high software craftsmanship and cross-functional leadership.',
      areasOfImprovement: 'Can delegate more sub-tasks to accelerate product cycle releases.',
      feedback: 'David is a cornerstone of the platform team, consistently driving high quality standards.',
      status: 'Submitted',
    });

    // 7. Notifications
    await Notification.create({
      recipient: adminUser._id,
      sender: devUser._id,
      title: 'Pending Leave Request',
      message: 'David Kim has applied for 2 days Annual Leave.',
      type: 'Leave',
      link: '/leaves',
    });

    await Notification.create({
      recipient: devUser._id,
      sender: adminUser._id,
      title: 'Q1 Review Published',
      message: 'Your performance evaluation for Q1 2026 has been finalized.',
      type: 'Performance',
      link: '/performance',
    });

    // 8. Audit Log
    await AuditLog.create({
      user: adminUser._id,
      action: 'SYSTEM_SEEDED',
      entity: 'System',
      entityId: 'ROOT',
      details: { environment: 'Development/Production', initialEmployees: 5 },
    });

    console.log('✅ Seed completed successfully with demo accounts:');
    console.log('   - Admin:    admin@peoplepulse.com    / Password123!');
    console.log('   - HR:       hr@peoplepulse.com       / Password123!');
    console.log('   - Manager:  manager@peoplepulse.com  / Password123!');
    console.log('   - Employee: employee@peoplepulse.com / Password123!');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedData();
