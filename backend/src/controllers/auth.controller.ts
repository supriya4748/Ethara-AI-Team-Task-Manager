import { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import * as authService from '../services/auth.service';

/**
 * Handle new user registration requests
 */
export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1. Zod input validation
    const parsedBody = registerSchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: parsedBody.error.flatten().fieldErrors,
      });
      return;
    }

    // 2. Process signup
    const data = await authService.registerUser(parsedBody.data);

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user session login requests
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1. Zod input validation
    const parsedBody = loginSchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: parsedBody.error.flatten().fieldErrors,
      });
      return;
    }

    // 2. Process login
    const data = await authService.loginUser(parsedBody.data);

    res.status(200).json({
      status: 'success',
      message: 'Logged in successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch profile details of current authenticated session
 */
export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Unauthorized access',
      });
      return;
    }

    const userData = await authService.getUserProfile(req.user.id);

    res.status(200).json({
      status: 'success',
      data: {
        user: userData,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch list of all registered workspace users
 */
export const getUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await authService.getAllUsers();
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};
