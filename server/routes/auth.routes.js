import express from 'express';
import { register, login, getCurrentUser } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getCurrentUser);

export default router;