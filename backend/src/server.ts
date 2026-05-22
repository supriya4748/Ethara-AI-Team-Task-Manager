import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes';
import { errorHandler } from './middlewares/error.middleware';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Main aggregated routing
app.use('/api', apiRouter);

// Base fallback route
app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to Ethara AI Team Task Manager API. Head over to /api/health for system status.',
  });
});

// Error handling middleware
app.use(errorHandler);

// Start the server
const server = app.listen(PORT, () => {
  logger.info(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

export default server;
