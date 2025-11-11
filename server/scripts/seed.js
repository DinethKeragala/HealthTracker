// Simple seed script to create a demo user and sample activities
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Activity from '../models/activity.model.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const run = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI missing in environment');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'demo@example.com';
    let user = await User.findOne({ email });
    if (!user) {
      const passwordHash = await bcrypt.hash('password123', 10);
      user = await User.create({
        username: 'demo',
        email,
        password: passwordHash,
        firstName: 'Demo',
        lastName: 'User',
      });
      console.log('Created demo user');
    } else {
      console.log('Demo user already exists');
    }

    const today = new Date();
    const fmt = (d) => d.toISOString().split('T')[0];
    const dayMinus = (n) => {
      const d = new Date();
      d.setDate(d.getDate() - n);
      return fmt(d);
    };

    const sample = [
      { type: 'running', duration: 30, calories: 320, distance: 5, date: fmt(today), notes: 'Morning run' },
      { type: 'cycling', duration: 45, calories: 450, distance: 20, date: dayMinus(1), notes: 'Park loop' },
      { type: 'gym', duration: 60, calories: 380, date: dayMinus(2), notes: 'Strength training' },
    ];

    // Avoid duplicating seed activities: check existence by user+type+date+duration
    for (const act of sample) {
      const exists = await Activity.findOne({ user: user._id, type: act.type, date: act.date, duration: act.duration });
      if (!exists) {
        await Activity.create({ ...act, user: user._id });
        console.log(`Inserted activity: ${act.type} ${act.date}`);
      } else {
        console.log(`Skipped existing activity: ${act.type} ${act.date}`);
      }
    }

    console.log('Seed complete');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

run();
