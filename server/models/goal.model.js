import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    goalType: {
      type: String,
      required: true,
      enum: ['steps', 'calories', 'workouts', 'distance', 'duration']
    },
    targetValue: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      trim: true,
      default: ''
    },
    period: {
      type: String,
      required: true,
      enum: ['daily', 'weekly', 'monthly']
    },
    startDate: {
      type: Date,
      default: () => new Date()
    },
    endDate: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

goalSchema.index({ userId: 1, isActive: 1, period: 1 });

const Goal = mongoose.model('Goal', goalSchema);

export default Goal;
