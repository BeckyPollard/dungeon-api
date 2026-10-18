const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  res.status(200).json({
    status: 'UP',
    database: isDbConnected ? 'CONNECTED' : 'DISCONNECTED',
    timestamp: new Date()
  });
});

module.exports = router;
