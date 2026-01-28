import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getSummaryStats, getGoalsProgress } from '../controllers/stats.controller.js';

const router = express.Router();

router.use(verifyToken);

router.get('/summary', getSummaryStats);
router.get('/goals-progress', getGoalsProgress);

export default router;
