import Activity from '../models/activity.model.js';

// Create new activity
export const createActivity = async (req, res) => {
  try {
    const { type, duration, calories, distance, date, notes } = req.body;
    const activity = await Activity.create({
      user: req.userId,
      type,
      duration,
      calories,
      distance: distance || undefined,
      date,
      notes,
    });
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all activities for current user (optional filter by type)
export const getActivities = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { user: req.userId };
    if (type) filter.type = type;
    const activities = await Activity.find(filter).sort({ date: -1, createdAt: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update activity
export const updateActivity = async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await Activity.findOne({ _id: id, user: req.userId });
    if (!existing) return res.status(404).json({ message: 'Activity not found' });

    const updateFields = ['type', 'duration', 'calories', 'distance', 'date', 'notes'];
    updateFields.forEach((field) => {
      if (req.body[field] !== undefined) existing[field] = req.body[field];
    });
    await existing.save();
    res.json(existing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete activity
export const deleteActivity = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Activity.findOneAndDelete({ _id: id, user: req.userId });
    if (!deleted) return res.status(404).json({ message: 'Activity not found' });
    res.json({ message: 'Activity deleted', id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
