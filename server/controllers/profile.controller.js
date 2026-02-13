import User from '../models/user.model.js';

const pick = (obj, allowedKeys) => {
  const out = {};
  for (const key of allowedKeys) {
    if (obj[key] !== undefined) out[key] = obj[key];
  }
  return out;
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const allowed = [
      'username',
      'firstName',
      'lastName',
      'profilePicture',
      'dateOfBirth',
      'gender',
      'heightCm',
      'weightKg'
    ];

    const update = pick(req.body, allowed);

    if (update.dateOfBirth) {
      const dob = new Date(update.dateOfBirth);
      if (Number.isNaN(dob.getTime())) {
        return res.status(400).json({ message: 'dateOfBirth must be a valid date' });
      }
      update.dateOfBirth = dob;
    }

    if (update.username) {
      const existing = await User.findOne({ username: update.username, _id: { $ne: req.userId } });
      if (existing) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
    }

    const user = await User.findByIdAndUpdate(req.userId, update, {
      new: true,
      runValidators: true,
      select: '-password'
    });

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
