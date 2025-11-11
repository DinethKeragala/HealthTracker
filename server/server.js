import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
import authRoutes from './routes/auth.routes.js';
app.use('/api/auth', authRoutes);
import activityRoutes from './routes/activity.routes.js';
app.use('/api/activities', activityRoutes);

app.get('/', (req, res) => {
  res.json({
    name: 'HealthTracker API',
    status: 'ok',
    docs: '/api/auth',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'backend', time: Date.now() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});