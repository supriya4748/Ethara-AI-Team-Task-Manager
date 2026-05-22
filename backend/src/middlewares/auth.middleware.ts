import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

// Define custom property on Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: 'ADMIN' | 'MEMBER';
      };
    }
  }
}

/**
 * Express middleware to authenticate incoming JWT tokens
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Check if authorization header exists and starts with Bearer
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        status: 'error',
        message: 'Access denied. No session token provided.',
      });
      return;
    }

    // 2. Extract and split Bearer token
    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({
        status: 'error',
        message: 'Access denied. Malformed authorization token.',
      });
      return;
    }

    // 3. Decode & verify JWT signature and expiry
    const decoded = verifyToken(token);
    
    // 4. Attach decoded payload to Request object
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role as 'ADMIN' | 'MEMBER',
    };

    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Access denied. Invalid or expired session token.',
    });
  }
};

/**
 * Express middleware to restrict route access based on role permissions
 */
export const authorize = (roles: Array<'ADMIN' | 'MEMBER'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        status: 'error',
        message: 'Permission denied. Insufficient workspace access level.',
      });
      return;
    }
    next();
  };
};
