import Goal from '../models/goal.model.js';
import GoalCheckin from '../models/goalCheckin.model.js';

const normalizeToStartOfDay = (value) => {
  const d = value ? new Date(value) : new Date();
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
};

export const listGoalCheckins = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    const limit = Math.min(200, Math.max(1, Number(req.query.limit || 30)));

    const items = await GoalCheckin.find({ userId: req.userId, goalId: goal._id })
      .sort({ date: -1 })
      .limit(limit);

    res.json({ items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upserts a check-in for the given goal + date.
export const upsertGoalCheckin = async (req, res) => {
  try {
    const { value, date } = req.body;

    if (value === undefined || value === null || Number.isNaN(Number(value))) {
      return res.status(400).json({ message: 'value is required' });
    }

    const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    const normalizedDate = normalizeToStartOfDay(date);
    if (!normalizedDate) return res.status(400).json({ message: 'Invalid date' });

    const saved = await GoalCheckin.findOneAndUpdate(
      { userId: req.userId, goalId: goal._id, date: normalizedDate },
      { $set: { value: Number(value) } },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json(saved);
  } catch (error) {
    // Handle unique index race gracefully
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'Check-in already exists for this date' });
    }
    res.status(500).json({ message: error.message });
  }
};

export const deleteGoalCheckin = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    const deleted = await GoalCheckin.findOneAndDelete({
      _id: req.params.checkinId,
      userId: req.userId,
      goalId: goal._id
    });

    if (!deleted) return res.status(404).json({ message: 'Check-in not found' });
    res.json({ message: 'Check-in deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
