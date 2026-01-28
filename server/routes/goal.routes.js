import express from 'express';
import {
  createGoal,
  listGoals,
  getGoalById,
  updateGoal,
  deleteGoal
} from '../controllers/goal.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', listGoals);
router.post('/', createGoal);
router.get('/:id', getGoalById);
router.patch('/:id', updateGoal);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);

export default router;
