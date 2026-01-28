import Goal from '../models/goal.model.js';

export const createGoal = async (req, res) => {
  try {
    const { goalType, targetValue, unit, period, startDate, endDate, isActive, title } = req.body;

    if (!goalType) return res.status(400).json({ message: 'goalType is required' });
    if (targetValue === undefined || targetValue === null) {
      return res.status(400).json({ message: 'targetValue is required' });
    }
    if (!period) return res.status(400).json({ message: 'period is required' });

    const goal = await Goal.create({
      userId: req.userId,
      goalType,
      targetValue,
      unit,
      period,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      isActive,
      title
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listGoals = async (req, res) => {
  try {
    const filter = { userId: req.userId };

    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    const goals = await Goal.find(filter).sort({ createdAt: -1 });
    res.json({ items: goals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGoalById = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateGoal = async (req, res) => {
  try {
    if ('userId' in req.body) delete req.body.userId;

    if (req.body.startDate) req.body.startDate = new Date(req.body.startDate);
    if (req.body.endDate) req.body.endDate = new Date(req.body.endDate);

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const deleted = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!deleted) return res.status(404).json({ message: 'Goal not found' });
    res.json({ message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
