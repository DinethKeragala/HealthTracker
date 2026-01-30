import mongoose from 'mongoose';

const goalCheckinSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
      required: true,
      index: true
    },
    // Normalized to start-of-day (00:00:00) for uniqueness.
    date: {
      type: Date,
      required: true,
      index: true
    },
    value: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { timestamps: true }
);

// One check-in per goal per day.
goalCheckinSchema.index({ userId: 1, goalId: 1, date: 1 }, { unique: true });

const GoalCheckin = mongoose.model('GoalCheckin', goalCheckinSchema);

export default GoalCheckin;
