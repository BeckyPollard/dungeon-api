const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("[SERVER] Success connect to mongoDB atlas server yahoo");
  } catch(error) {
    logger.error(`Could not connect to MongoDB server! ${error}`);
    process.exit(1);
  }
};

module.exports = connectDB;
