import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  display: {
    type: String,
    required: true
  },
  tenant: {
    type: String,
    enum: ['UVU', 'UofU'],
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Ensure course ID is unique within a tenant
courseSchema.index({ id: 1, tenant: 1 }, { unique: true });

export const Course = mongoose.model('Course', courseSchema);