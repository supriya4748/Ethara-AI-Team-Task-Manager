import { Request, Response, NextFunction } from 'express';
import { createTaskSchema, updateTaskSchema, updateTaskStatusSchema } from '../validators/task.validator';
import * as taskService from '../services/task.service';

/**
 * Get all tasks, with filtering by project, assignee, or status
 */
export const getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { projectId, assigneeId, status } = req.query;

    const data = await taskService.getAllTasks({
      projectId: projectId as string,
      assigneeId: assigneeId as string,
      status: status as 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE',
    });

    res.status(200).json({
      status: 'success',
      results: data.length,
      data: { tasks: data },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get task details by ID
 */
export const getTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const data = await taskService.getTaskById(id);
    res.status(200).json({
      status: 'success',
      data: { task: data },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new task (Admin only)
 */
export const createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1. Zod input validation
    const parsedBody = createTaskSchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: parsedBody.error.flatten().fieldErrors,
      });
      return;
    }

    // 2. Save task
    const newTask = await taskService.createTask(parsedBody.data);

    res.status(201).json({
      status: 'success',
      message: 'Task created successfully',
      data: { task: newTask },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update task core specifications (Admin only)
 */
export const updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    // 1. Zod input validation
    const parsedBody = updateTaskSchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: parsedBody.error.flatten().fieldErrors,
      });
      return;
    }

    // 2. Process update
    const updatedTask = await taskService.updateTask(id, parsedBody.data);

    res.status(200).json({
      status: 'success',
      message: 'Task details updated successfully',
      data: { task: updatedTask },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update only task progress status (Admin & Member permissions)
 */
export const updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    // 1. Zod input validation
    const parsedBody = updateTaskStatusSchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: parsedBody.error.flatten().fieldErrors,
      });
      return;
    }

    // 2. Process status update
    const updatedTask = await taskService.updateTaskStatus(id, parsedBody.data.status);

    res.status(200).json({
      status: 'success',
      message: `Task status updated to ${parsedBody.data.status} successfully`,
      data: { task: updatedTask },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a task (Admin only)
 */
export const deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await taskService.deleteTask(id);

    res.status(200).json({
      status: 'success',
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch all overdue tasks
 */
export const getOverdue = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await taskService.getOverdueTasks();
    res.status(200).json({
      status: 'success',
      results: data.length,
      data: { tasks: data },
    });
  } catch (error) {
    next(error);
  }
};
