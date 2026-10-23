const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  uploadProfilePhoto,
  employeeSchema,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');

router.use(protect);

router
  .route('/')
  .get(getEmployees)
  .post(authorize('Admin', 'HR'), validate(employeeSchema), createEmployee);

router
  .route('/:id')
  .get(getEmployeeById)
  .put(authorize('Admin', 'HR'), updateEmployee);

router.patch('/:id/status', authorize('Admin', 'HR'), updateEmployeeStatus);
router.post('/:id/photo', upload.single('photo'), uploadProfilePhoto);

module.exports = router;
