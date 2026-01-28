import Activity from '../models/activity.model.js';

const parsePositiveInt = (value, defaultValue, maxValue) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return defaultValue;
  return Math.min(parsed, maxValue);
};

const parseDate = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
};

export const createActivity = async (req, res) => {
  try {
    const {
      activityType,
      title,
      notes,
      startedAt,
      endedAt,
      durationMinutes,
      distanceKm,
      steps,
      caloriesBurned,
      source
    } = req.body;

    if (!activityType) {
      return res.status(400).json({ message: 'activityType is required' });
    }

    const started = parseDate(startedAt);
    if (!started) {
      return res.status(400).json({ message: 'startedAt must be a valid date' });
    }

    const ended = parseDate(endedAt);
    if (ended && ended < started) {
      return res.status(400).json({ message: 'endedAt must be after startedAt' });
    }

    let computedDuration = durationMinutes;
    if ((computedDuration === undefined || computedDuration === null) && ended) {
      const ms = ended.getTime() - started.getTime();
      computedDuration = Math.max(0, Math.round(ms / 60000));
    }

    const activity = await Activity.create({
      userId: req.userId,
      activityType,
      title,
      notes,
      startedAt: started,
      endedAt: ended,
      durationMinutes: computedDuration,
      distanceKm,
      steps,
      caloriesBurned,
      source
    });

    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listActivities = async (req, res) => {
  try {
    const page = parsePositiveInt(req.query.page, 1, 1000000);
    const limit = parsePositiveInt(req.query.limit, 20, 100);
    const skip = (page - 1) * limit;

    const from = parseDate(req.query.from);
    const to = parseDate(req.query.to);

    const filter = { userId: req.userId };

    if (req.query.activityType) {
      filter.activityType = req.query.activityType;
    }

    if (from || to) {
      filter.startedAt = {};
      if (from) filter.startedAt.$gte = from;
      if (to) filter.startedAt.$lte = to;
    }

    const sort = req.query.sort === 'startedAtAsc' ? { startedAt: 1 } : { startedAt: -1 };

    const [items, total] = await Promise.all([
      Activity.find(filter).sort(sort).skip(skip).limit(limit),
      Activity.countDocuments(filter)
    ]);

    res.json({
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findOne({ _id: req.params.id, userId: req.userId });
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateActivity = async (req, res) => {
  try {
    if ('userId' in req.body) delete req.body.userId;

    const started = req.body.startedAt ? parseDate(req.body.startedAt) : undefined;
    const ended = req.body.endedAt ? parseDate(req.body.endedAt) : undefined;

    if (req.body.startedAt && !started) {
      return res.status(400).json({ message: 'startedAt must be a valid date' });
    }
    if (req.body.endedAt && !ended) {
      return res.status(400).json({ message: 'endedAt must be a valid date' });
    }

    if (started) req.body.startedAt = started;
    if (ended) req.body.endedAt = ended;

    if (started && ended && ended < started) {
      return res.status(400).json({ message: 'endedAt must be after startedAt' });
    }

    const activity = await Activity.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteActivity = async (req, res) => {
  try {
    const deleted = await Activity.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!deleted) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.json({ message: 'Activity deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
