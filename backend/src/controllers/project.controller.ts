import { Request, Response, NextFunction } from 'express';
import { createProjectSchema, updateProjectSchema } from '../validators/project.validator';
import * as projectService from '../services/project.service';

/**
 * Get all projects in the workspace
 */
export const getProjects = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await projectService.getAllProjects();
    res.status(200).json({
      status: 'success',
      results: data.length,
      data: { projects: data },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get project details by ID
 */
export const getProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const data = await projectService.getProjectById(id);
    res.status(200).json({
      status: 'success',
      data: { project: data },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new project (Admin only)
 */
export const createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    // 1. Zod input validation
    const parsedBody = createProjectSchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: parsedBody.error.flatten().fieldErrors,
      });
      return;
    }

    // 2. Save project
    const newProject = await projectService.createProject(parsedBody.data, req.user.id);

    res.status(201).json({
      status: 'success',
      message: 'Project created successfully',
      data: { project: newProject },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update project details (Admin only)
 */
export const updateProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    // 1. Zod input validation
    const parsedBody = updateProjectSchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: parsedBody.error.flatten().fieldErrors,
      });
      return;
    }

    // 2. Process update
    const updatedProject = await projectService.updateProject(id, parsedBody.data);

    res.status(200).json({
      status: 'success',
      message: 'Project updated successfully',
      data: { project: updatedProject },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a project (Admin only)
 */
export const deleteProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await projectService.deleteProject(id);
    
    res.status(200).json({
      status: 'success',
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
