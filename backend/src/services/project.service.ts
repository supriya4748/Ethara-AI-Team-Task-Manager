import { prisma } from '../config/database';
import { CreateProjectInput, UpdateProjectInput } from '../validators/project.validator';

/**
 * Resolves all projects persisted in the database
 */
export const getAllProjects = async () => {
  return prisma.project.findMany({
    include: {
      owner: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
      _count: {
        select: { tasks: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

/**
 * Resolves a single project's details
 * @param id Project UUID
 */
export const getProjectById = async (id: string) => {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
      tasks: {
        include: {
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
      },
    },
  });

  if (!project) {
    const error = new Error('Project not found') as any;
    error.statusCode = 404;
    throw error;
  }

  return project;
};

/**
 * Creates a new project in the database
 * @param input Create project validation data
 * @param ownerId Creator User UUID
 */
export const createProject = async (input: CreateProjectInput, ownerId: string) => {
  return prisma.project.create({
    data: {
      name: input.name,
      description: input.description || null,
      ownerId,
    },
    include: {
      owner: {
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
 * Updates project details
 * @param id Project UUID
 * @param input Update project validation data
 */
export const updateProject = async (id: string, input: UpdateProjectInput) => {
  // Ensure project exists
  await getProjectById(id);

  return prisma.project.update({
    where: { id },
    data: {
      name: input.name,
      description: input.description,
    },
    include: {
      owner: {
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
 * Deletes a project from the database
 * @param id Project UUID
 */
export const deleteProject = async (id: string) => {
  // Ensure project exists
  await getProjectById(id);

  return prisma.project.delete({
    where: { id },
  });
};
