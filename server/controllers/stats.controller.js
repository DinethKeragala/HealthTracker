import Activity from '../models/activity.model.js';
import Goal from '../models/goal.model.js';

const parseDate = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
};

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const startOfWeek = () => {
  const d = startOfToday();
  const day = d.getDay();
  const diff = (day + 6) % 7; // Monday as start
  d.setDate(d.getDate() - diff);
  return d;
};

const startOfMonth = () => {
  const d = startOfToday();
  d.setDate(1);
  return d;
};

const computeRangeForPeriod = (period) => {
  if (period === 'daily') return { from: startOfToday(), to: new Date() };
  if (period === 'weekly') return { from: startOfWeek(), to: new Date() };
  if (period === 'monthly') return { from: startOfMonth(), to: new Date() };
  return { from: undefined, to: undefined };
};

export const getSummaryStats = async (req, res) => {
  try {
    const from = parseDate(req.query.from) || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const to = parseDate(req.query.to) || new Date();

    const match = {
      userId: req.userId,
      startedAt: { $gte: from, $lte: to }
    };

    const [totals] = await Activity.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          activities: { $sum: 1 },
          steps: { $sum: { $ifNull: ['$steps', 0] } },
          caloriesBurned: { $sum: { $ifNull: ['$caloriesBurned', 0] } },
          distanceKm: { $sum: { $ifNull: ['$distanceKm', 0] } },
          durationMinutes: { $sum: { $ifNull: ['$durationMinutes', 0] } }
        }
      }
    ]);

    const byType = await Activity.aggregate([
      { $match: match },
      { $group: { _id: '$activityType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const daily = await Activity.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$startedAt' }
          },
          activities: { $sum: 1 },
          steps: { $sum: { $ifNull: ['$steps', 0] } },
          caloriesBurned: { $sum: { $ifNull: ['$caloriesBurned', 0] } },
          distanceKm: { $sum: { $ifNull: ['$distanceKm', 0] } },
          durationMinutes: { $sum: { $ifNull: ['$durationMinutes', 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      range: { from, to },
      totals: totals || {
        activities: 0,
        steps: 0,
        caloriesBurned: 0,
        distanceKm: 0,
        durationMinutes: 0
      },
      byType,
      daily
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGoalsProgress = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.userId, isActive: true }).sort({ createdAt: -1 });

    const progress = await Promise.all(
      goals.map(async (goal) => {
        const { from, to } = computeRangeForPeriod(goal.period);
        const match = { userId: req.userId };
        if (from && to) match.startedAt = { $gte: from, $lte: to };

        const [totals] = await Activity.aggregate([
          { $match: match },
          {
            $group: {
              _id: null,
              steps: { $sum: { $ifNull: ['$steps', 0] } },
              caloriesBurned: { $sum: { $ifNull: ['$caloriesBurned', 0] } },
              distanceKm: { $sum: { $ifNull: ['$distanceKm', 0] } },
              durationMinutes: { $sum: { $ifNull: ['$durationMinutes', 0] } },
              workouts: { $sum: 1 }
            }
          }
        ]);

        const t = totals || {
          steps: 0,
          caloriesBurned: 0,
          distanceKm: 0,
          durationMinutes: 0,
          workouts: 0
        };

        let currentValue = 0;
        if (goal.goalType === 'steps') currentValue = t.steps;
        if (goal.goalType === 'calories') currentValue = t.caloriesBurned;
        if (goal.goalType === 'distance') currentValue = t.distanceKm;
        if (goal.goalType === 'duration') currentValue = t.durationMinutes;
        if (goal.goalType === 'workouts') currentValue = t.workouts;

        const percent = goal.targetValue > 0 ? Math.min(100, (currentValue / goal.targetValue) * 100) : 0;

        return {
          goal,
          periodRange: { from, to },
          currentValue,
          percent
        };
      })
    );

    res.json({ items: progress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
