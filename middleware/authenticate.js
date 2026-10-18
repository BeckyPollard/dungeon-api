const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const authenticate = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    logger.warn(`No auth token given by ${req.ip}`);
    return res.status(401).json({ error: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn(`Expired auth token given by IP ${req.ip}`);
      return res.status(401).json({ error: 'Authentication failed because token is expired.' });
    }

    if (error.name === 'JsonWebTokenError') {
      logger.warn(`Invalid token given by IP ${req.ip}`);
      return res.status(401).json({ error: 'Authentication failed because token is bad.' });
    }

    logger.warn(`Invalid auth token from ${req.ip}`);
    return res.status(401).json({ error: 'Validation error.' });
  }
};

module.exports = { authenticate };
