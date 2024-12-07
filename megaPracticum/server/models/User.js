import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'TA', 'student'],
    required: true
  },
  tenant: {
    type: String,
    enum: ['UVU', 'UofU'],
    required: true
  },
  uvuId: {
    type: String,
    default: function() {
      return this.tenant === 'UVU' && this.role === 'student' ? '10111111' : undefined;
    }
  },
  uofuId: {
    type: String,
    default: function() {
      return this.tenant === 'UofU' && this.role === 'student' ? '20222222' : undefined;
    }
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Ensure student IDs are set based on tenant
userSchema.pre('save', function(next) {
  if (this.role === 'student') {
    if (this.tenant === 'UVU' && !this.uvuId) {
      this.uvuId = '10111111';
    }
    if (this.tenant === 'UofU' && !this.uofuId) {
      this.uofuId = '20222222';
    }
  }
  next();
});

export const User = mongoose.model('User', userSchema);