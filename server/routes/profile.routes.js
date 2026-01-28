import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getProfile, updateProfile } from '../controllers/profile.controller.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getProfile);
router.patch('/', updateProfile);
router.put('/', updateProfile);

export default router;
