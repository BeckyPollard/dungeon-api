const express = require('express');
const {check, validationResult} = require('express-validator'); // https://express-validator.github.io/docs/
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const {limiter} = require('../middleware/limiter');
const logger = require('../config/logger');

const router = express.Router();

const validateUserInput = [
  check('username', 'Username is required').notEmpty().trim(),
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Password must be 6 or more characters').isLength({min: 6})
];

// POST /api/v1/user/signup
router.post('/signup', limiter, validateUserInput, async (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    logger.warn(`Validation fail during registration from IP ${req.ip}: ${JSON.stringify(errors.array())}`);
    return res.status(400).json({errors: errors.array()});
  }

  const {username, email, password} = req.body;

  try {
    let userExists = await User.findOne({
      $or: [
        {email: email.toLowerCase().trim()},
        {username: {$regex: `^${username.trim()}$`, $options: 'i'}}
      ]
    });

    if(userExists) {
      logger.warn(`Creation failed because user already exists for ${email} or username ${username}`);
      return res.status(409).json({
        status: false,
        message: 'User already exists with that email or username'
      });
    }

    const user = await User.create({username, email, password});

    logger.info(`User ${user.username} registered successfully.`);

    res.status(201).json({
      message: 'User registered successfully',
      user
    });
  } catch(error) {
    next(error);
  }
});

// POST /api/v1/user/login
// frontend: store JWT into localstorage
router.post('/login', limiter, async (req, res, next) => {
  const {identifier, email, username, password} = req.body;
  const loginCredential = identifier || email || username;

  if(!loginCredential || !password) {
    logger.warn(`Missing creds in login request from ${req.ip}`);
    return res.status(400).json({
      status: false,
      message: 'Username/Email and password are required'
    });
  }

  try {
    const user = await User.findOne({
      $or: [
        {email: loginCredential.toLowerCase().trim()},
        {username: {$regex: `^${loginCredential.trim()}$`, $options: 'i'}}
      ]
    });

    if(!user || !(await user.matchPassword(password))) {
      logger.warn(`Invalid login creds: ${loginCredential}`);
      return res.status(400).json({
        status: false,
        message: 'Invalid Username and password'
      });
    }

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '1h'});

    logger.info(`User ${user.username} logged in.`);

    res.status(200).json({
      message: 'Login successful.',
      jwt_token: token
    });
  } catch(error) {
    next(error);
  }
});

// handle logout on frontend, destroy JWT from localstorage

module.exports = router;
