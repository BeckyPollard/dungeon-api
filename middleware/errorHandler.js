const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.status || 500;
  let errorMessage = err.message || 'Unexpected server error.';
  let errorType = err.name || 'InternalServerError';

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    logger.warn(`Malformed JSON body payload from ${req.ip}`);
    return res.status(400).json({ error: 'Malformed JSON.' });
  }

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    logger.warn(`Bad ObjectId submission from ${req.originalUrl}`);
    return res.status(400).json({ error: 'Invalid ID given.' });
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorType = 'ValidationError';
    errorMessage = Object.values(err.errors).map(val => val.message).join(', ');
    logger.warn(`Database Schema Validation failure: ${errorMessage}`);
  }

  // TODO: format better
  logger.error(`${errorType} ${statusCode} ${req.method} ${req.originalUrl} ${req.ip} ${errorMessage}`);

  res.status(statusCode).json({
    status: false,
    error: errorMessage,
    type: errorType,
    ...(process.env.ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
