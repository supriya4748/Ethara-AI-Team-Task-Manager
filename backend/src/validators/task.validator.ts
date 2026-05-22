import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(2, 'Task title must be at least 2 characters long'),
  description: z.string().optional().nullable(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().datetime({ message: 'Invalid datetime format. Expected ISO 8601 string.' }).optional().nullable(),
  projectId: z.string().uuid('Invalid projectId. Expected UUID format.'),
  assigneeId: z.string().uuid('Invalid assigneeId. Expected UUID format.').optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const updateTaskStatusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'], {
    errorMap: () => ({ message: "Status must be 'TODO', 'IN_PROGRESS', 'REVIEW', or 'DONE'" }),
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
