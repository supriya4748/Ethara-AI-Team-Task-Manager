import { Request, Response, NextFunction } from 'express';

/**
 * Enforce Role-Based Access Control (RBAC) on routes
 * @param roles Array of permitted roles (e.g. ['ADMIN'])
 */
export const restrictTo = (...roles: Array<'ADMIN' | 'MEMBER'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // 1. Ensure user session is attached via authentication middleware
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required to access this resource.',
      });
      return;
    }

    // 2. Check if user's role is permitted
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        status: 'error',
        message: 'Access denied. You do not have permissions to perform this operation.',
      });
      return;
    }

    next();
  };
};
