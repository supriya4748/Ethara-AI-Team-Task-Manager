import { Router } from 'express';
import { getProjects, getProject, createProject, updateProject, deleteProject } from '../controllers/project.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { restrictTo } from '../middlewares/role.middleware';

const router = Router();

// Apply authentication to all project routes
router.use(authenticate);

// Public workspace view routes (Admins & Members)
router.get('/', getProjects);
router.get('/:id', getProject);

// Administrative modification routes (Admin only)
router.post('/', restrictTo('ADMIN'), createProject);
router.put('/:id', restrictTo('ADMIN'), updateProject);
router.delete('/:id', restrictTo('ADMIN'), deleteProject);

export default router;
