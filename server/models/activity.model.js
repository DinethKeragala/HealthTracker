import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    activityType: {
      type: String,
      required: true,
      enum: [
        'workout',
        'walk',
        'run',
        'cycle',
        'swim',
        'strength',
        'yoga',
        'sport',
        'steps',
        'other'
      ]
    },
    title: {
      type: String,
      trim: true,
      default: ''
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    startedAt: {
      type: Date,
      required: true,
      index: true
    },
    endedAt: {
      type: Date
    },
    durationMinutes: {
      type: Number,
      min: 0
    },
    distanceKm: {
      type: Number,
      min: 0
    },
    steps: {
      type: Number,
      min: 0
    },
    caloriesBurned: {
      type: Number,
      min: 0
    },
    source: {
      type: String,
      trim: true,
      default: 'manual'
    }
  },
  {
    timestamps: true
  }
);

activitySchema.index({ userId: 1, startedAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
