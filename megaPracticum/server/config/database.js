import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

export const connectDB = async () => {
  try {
    if (!process.env.MONGODB_USERNAME ||
        !process.env.MONGODB_PASSWORD ||
        !process.env.MONGODB_CLUSTER ||
        !process.env.MONGODB_COLLECTION) {
      throw new Error('Missing MongoDB environment variables');
    }

    const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}.ebt9u.mongodb.net/${process.env.MONGODB_COLLECTION}?retryWrites=true&w=majority&appName=${process.env.MONGODB_CLUSTER}`;

    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected Successfully');

    // Check if admin users exist
    const adminCount = await User.countDocuments({ role: 'admin' });

    if (adminCount === 0) {
      // Create UVU admin
      const hashedPasswordUVU = await bcrypt.hash('willy', 10);
      await User.create({
        username: 'root_uvu',
        password: hashedPasswordUVU,
        role: 'admin',
        tenant: 'UVU'
      });

      // Create UofU admin
      const hashedPasswordUofU = await bcrypt.hash('swoopy', 10);
      await User.create({
        username: 'root_uofu',
        password: hashedPasswordUofU,
        role: 'admin',
        tenant: 'UofU'
      });

      console.log('Initial admin users created');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};