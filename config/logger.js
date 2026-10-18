const fs = require('fs');
const path = require('path');

const logDirectory = path.join(__dirname, '../logs');
if(!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, {recursive: true});
}

const logFilePath = path.join(logDirectory, 'logging.log');
// i want to make a lumberjack joke here so bad but i need to keep this professional
// be proud i didn't name the log file lumberjack.log because i did consider it

const logger = {
  writeLog: (level, message) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const logMessage = `[${timestamp}] [${level.toUpperCase()}]: ${message}\n`;

    console.log(logMessage.trim());

    fs.appendFile(logFilePath, logMessage, (err) => {
      if(err) console.error('Failed! To write to log file:', err);
    });
  },

  info: (msg) => logger.writeLog('info', msg),
  warn: (msg) => logger.writeLog('warn', msg),
  error: (msg) => logger.writeLog('error', msg)
};

module.exports = logger;
