const express = require('express');
const {check, validationResult} = require('express-validator'); // https://express-validator.github.io/docs/
const Character = require('../models/CharacterModel');
const {authenticate} = require('../middleware/authenticate');
const logger = require('../config/logger');

const router = express.Router(); //https://expressjs.com/en/5x/api/router/

// TODO after schema
// const validateCharacter = [
//   // https://express-validator.github.io/docs/api/check/
//   check('first_name', 'First name required').notEmpty().trim(),
//   check('last_name', 'Last name required').notEmpty().trim(),
//   check('email', 'Please enter valid email address').isEmail().normalizeEmail(),
//   check('position', 'Position required').notEmpty().trim(),
//   check('salary', 'Salary must be positive number').isFloat({min: 0}),
//   check('department', 'Department required').notEmpty().trim()
// ];


module.exports = router;
