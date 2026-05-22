import { Request, Response, NextFunction } from 'express';

export const getHealth = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({
      status: 'success',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      message: 'Ethara AI Task Manager API is healthy',
      phase: 0,
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'connected (simulated for Phase 0)',
      },
    });
  } catch (error) {
    next(error);
  }
};
