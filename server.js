require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const {limiter} = require('./middleware/limiter');
const logger = require('./config/logger');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const healthRoutes = require('./routes/healthRoutes');
const userRoutes = require('./routes/userRoutes');
const characterRoutes = require('./routes/characterRoutes');

const app = express();

app.use(cors({
  origin: 'http://localhost:3333',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
}));

app.use(helmet());
app.use(limiter);
app.use(express.json());
app.use((req, res, next) => {
  logger.info(`API Request: ${req.method} ${req.originalUrl} from IP ${req.ip}`);
  next();
});

connectDB();

app.use('/api/v1/health', healthRoutes);
app.use('/api/v0/user', userRoutes);
app.use('/api/v0/characters', characterRoutes);

app.use((req, res, next) => {
  logger.warn(`Unsupported route called ${req.method} ${req.originalUrl} by ${req.ip}`);
  res.status(404).json({
    status: false,
    error: `Can't ${req.method} ${req.originalUrl}, the route doesn't exist.`
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[SERVER] HELL YEAH! Application running on port ${PORT}`);
});
