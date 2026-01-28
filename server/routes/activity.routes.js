import express from 'express';
import {
  createActivity,
  listActivities,
  getActivityById,
  updateActivity,
  deleteActivity
} from '../controllers/activity.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', listActivities);
router.post('/', createActivity);
router.get('/:id', getActivityById);
router.patch('/:id', updateActivity);
router.put('/:id', updateActivity);
router.delete('/:id', deleteActivity);

export default router;
