// EXAMPLE CODE FROM LEARNING PROJECT

const express = require('express');
const {check, validationResult} = require('express-validator'); // https://express-validator.github.io/docs/
const Employee = require('../models/EmployeeModel');
const {authenticate} = require('../middleware/authenticate');
const logger = require('../config/logger');

const router = express.Router(); //https://expressjs.com/en/5x/api/router/

const validateEmployee = [
  // https://express-validator.github.io/docs/api/check/
  check('first_name', 'First name required').notEmpty().trim(),
  check('last_name', 'Last name required').notEmpty().trim(),
  check('email', 'Please enter valid email address').isEmail().normalizeEmail(),
  check('position', 'Position required').notEmpty().trim(),
  check('salary', 'Salary must be positive number').isFloat({min: 0}),
  check('department', 'Department required').notEmpty().trim()
];

// GET /api/v1/emp/employees
router.get('/employees', authenticate, async (req, res, next) => {
  try {
    const employees = await Employee.find({user: req.user.id});

    res.status(200).json(employees);
  } catch(error) {
    next(error);
  }
});

// POST /api/v1/emp/employees
router.post('/employees', authenticate, validateEmployee, async (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    logger.warn(`Validation fail for employee create.}`);
    return res.status(400).json({errors: errors.array()});
  }

  const {email} = req.body;

  try {
    const employeeExists = await Employee.findOne({email: email.toLowerCase().trim(), user: req.user.id});

    if(employeeExists) {
      logger.warn(`Creation failed because employee already exists for ${email}`);
      return res.status(409).json({
        status: false,
        message: 'User already exists with that email'
      });
    }

    const employee = new Employee({...req.body, user: req.user.id});
    await employee.save();

    logger.info(`Employee ${employee._id} created by user ${req.user.id}`);
    res.status(201).json({message: 'Employee created.', employee_id: employee._id});
  } catch(error) {
    next(error);
  }
});

// GET /api/v1/emp/employees/:eid
router.get('/employees/:eid', authenticate, async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.eid);

    if(!employee) {
      logger.warn(`Employee ${req.params.eid} does not exist.`);
      return res.status(404).json({error: 'Employee record not found.'});
    }

    if(employee.user.toString() !== req.user.id) {
      logger.warn(`User ${req.user.id} denied access to employee ${req.params.eid}`);
      return res.status(403).json({error: "Access denied you don't own this employee data or this employee because they're their own person."});
      // hello professor, how are you? i'm feeling very silly tonight
    }

    res.status(200).json(employee);
  } catch(error) {
    next(error);
  }
});

// PUT /api/v1/emp/employees/:eid
router.put('/employees/:eid', authenticate, validateEmployee, async (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

  try {
    const employeeCheck = await Employee.findById(req.params.eid);
    if(!employeeCheck) return res.status(404).json({error: 'Employee record not found.'});

    if(employeeCheck.user.toString() !== req.user.id) {
      logger.warn(`User ${req.user.id} denied to edit employee ${req.params.eid}`);
      return res.status(403).json({error: "Access denied because you don't own this employee data."});
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.eid,
      req.body,
      {new: true, runValidators: true}
    );

    logger.info(`Employee ${employee._id} updated by user ${req.user.id}`);
    res.status(200).json({message: 'Employee details updated.', employee});
  } catch(error) {
    next(error);
  }
});

// DELETE /api/v1/emp/employees?eid=xxx
router.delete('/employees', authenticate, async (req, res, next) => {
  const employeeId = req.query.eid;

  if(!employeeId) {
    return res.status(400).json({error: 'Employee ID required'});
  }

  try {
    const employeeCheck = await Employee.findById(employeeId);
    if(!employeeCheck) {
      return res.status(404).json({error: 'Employee not found.'});
    }

    if(employeeCheck.user.toString() !== req.user.id) {
      logger.warn(`User ${req.user.id} denied to delete employee ${employeeId}`);
      return res.status(403).json({error: "Access denied because you don't own this employee data."});
    }

    await Employee.findByIdAndDelete(employeeId);
    logger.info(`Employee ${employeeId} deleted by user ${req.user.id}`);

    res.status(204).send();
  } catch(error) {
    next(error);
  }
});

module.exports = router;
