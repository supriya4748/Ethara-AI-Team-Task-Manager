import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import projectRoutes from './project.routes';
import taskRoutes from './task.routes';

const router = Router();

// Aggregate routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);

export default router;
