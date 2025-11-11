import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['running', 'cycling', 'swimming', 'walking', 'gym', 'yoga', 'other'],
      required: true,
      default: 'running',
      lowercase: true,
      trim: true,
    },
    duration: { type: Number, required: true, min: 1 }, // minutes
    calories: { type: Number, required: true, min: 0 },
    distance: { type: Number, min: 0 }, // km, optional
    date: { type: String, required: true }, // store as YYYY-MM-DD to match frontend
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// optional compound index for user+date sorting
activitySchema.index({ user: 1, date: -1, createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
