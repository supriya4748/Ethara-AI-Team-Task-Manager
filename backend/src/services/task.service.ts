import { prisma } from '../config/database';
import { CreateTaskInput, UpdateTaskInput } from '../validators/task.validator';

interface TaskFilters {
  projectId?: string;
  assigneeId?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
}

/**
 * Resolves all tasks, supporting project, assignee, or status filters
 */
export const getAllTasks = async (filters: TaskFilters) => {
  const whereClause: any = {};

  if (filters.projectId) {
    whereClause.projectId = filters.projectId;
  }
  if (filters.assigneeId) {
    whereClause.assigneeId = filters.assigneeId;
  }
  if (filters.status) {
    whereClause.status = filters.status;
  }

  return prisma.task.findMany({
    where: whereClause,
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      assignee: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

/**
 * Resolves a single task's details
 * @param id Task UUID
 */
export const getTaskById = async (id: string) => {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      assignee: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
    },
  });

  if (!task) {
    const error = new Error('Task not found') as any;
    error.statusCode = 404;
    throw error;
  }

  return task;
};

/**
 * Creates a new task in the database, verifying relational targets
 * @param input Create task validation data
 */
export const createTask = async (input: CreateTaskInput) => {
  // 1. Verify project exists
  const project = await prisma.project.findUnique({
    where: { id: input.projectId },
  });
  if (!project) {
    const error = new Error('Associated Project not found in database') as any;
    error.statusCode = 400;
    throw error;
  }

  // 2. Verify assignee user exists if provided
  if (input.assigneeId) {
    const assignee = await prisma.user.findUnique({
      where: { id: input.assigneeId },
    });
    if (!assignee) {
      const error = new Error('Assigned User not found in database') as any;
      error.statusCode = 400;
      throw error;
    }
  }

  // 3. Create task record
  return prisma.task.create({
    data: {
      title: input.title,
      description: input.description || null,
      status: input.status || 'TODO',
      priority: input.priority || 'MEDIUM',
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      projectId: input.projectId,
      assigneeId: input.assigneeId || null,
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      assignee: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
    },
  });
};

/**
 * Updates task properties, checking optional relational targets
 * @param id Task UUID
 * @param input Update task validation data
 */
export const updateTask = async (id: string, input: UpdateTaskInput) => {
  // Ensure task exists
  const currentTask = await getTaskById(id);

  // 1. If project is updating, verify it exists
  if (input.projectId && input.projectId !== currentTask.projectId) {
    const project = await prisma.project.findUnique({
      where: { id: input.projectId },
    });
    if (!project) {
      const error = new Error('Associated Project not found in database') as any;
      error.statusCode = 400;
      throw error;
    }
  }

  // 2. If assignee is updating, verify user exists
  if (input.assigneeId) {
    const assignee = await prisma.user.findUnique({
      where: { id: input.assigneeId },
    });
    if (!assignee) {
      const error = new Error('Assigned User not found in database') as any;
      error.statusCode = 400;
      throw error;
    }
  }

  // 3. Update task
  return prisma.task.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      dueDate: input.dueDate !== undefined ? (input.dueDate ? new Date(input.dueDate) : null) : undefined,
      projectId: input.projectId,
      assigneeId: input.assigneeId !== undefined ? input.assigneeId : undefined,
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      assignee: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
    },
  });
};

/**
 * Updates only status of the task
 * @param id Task UUID
 * @param status Valid status enum
 */
export const updateTaskStatus = async (id: string, status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE') => {
  // Ensure task exists
  await getTaskById(id);

  return prisma.task.update({
    where: { id },
    data: { status },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      assignee: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
    },
  });
};

/**
 * Deletes a task from the database
 * @param id Task UUID
 */
export const deleteTask = async (id: string) => {
  // Ensure task exists
  await getTaskById(id);

  return prisma.task.delete({
    where: { id },
  });
};

/**
 * Resolves all currently overdue tasks (status is not DONE and dueDate is in the past)
 */
export const getOverdueTasks = async () => {
  const now = new Date();
  
  return prisma.task.findMany({
    where: {
      status: {
        not: 'DONE',
      },
      dueDate: {
        lt: now,
        not: null,
      },
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      assignee: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
    },
    orderBy: {
      dueDate: 'asc',
    },
  });
};
