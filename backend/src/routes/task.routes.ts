import { Router } from 'express';
import { getTasks, getTask, createTask, updateTask, updateStatus, deleteTask, getOverdue } from '../controllers/task.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { restrictTo } from '../middlewares/role.middleware';

const router = Router();

// Apply authentication to all task routes
router.use(authenticate);

// Public workspace view routes (Admins & Members)
router.get('/', getTasks);
router.get('/overdue', getOverdue);
router.get('/:id', getTask);

// Administrative modification routes (Admin only)
router.post('/', restrictTo('ADMIN'), createTask);
router.put('/:id', restrictTo('ADMIN'), updateTask);
router.delete('/:id', restrictTo('ADMIN'), deleteTask);

// Status progression updates (Admins & Members)
router.patch('/:id/status', updateStatus);

export default router;
