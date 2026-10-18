const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

// https://www.npmjs.com/package/express-rate-limit

const limiter = rateLimit({
  windowMs: 300000, // this is, like, 5 minutes
  max: 50,
  message: {
    status: false,
    error: 'Too many requests, please try again later in, like, 5 minutes.'
  },
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for ${req.ip} on ${req.originalUrl}`);
    res.status(options.statusCode).send(options.message);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { limiter };
