import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { createActivity, getActivities, updateActivity, deleteActivity } from '../controllers/activity.controller.js';

const router = express.Router();

// All routes require auth
router.use(verifyToken);

router.get('/', getActivities);
router.post('/', createActivity);
router.put('/:id', updateActivity);
router.delete('/:id', deleteActivity);

export default router;
