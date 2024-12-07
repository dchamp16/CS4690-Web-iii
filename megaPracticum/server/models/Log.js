import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true
  },
  uvuId: {
    type: String
  },
  uofuId: {
    type: String
  },
  text: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  tenant: {
    type: String,
    required: true,
    enum: ['UVU', 'UofU']
  }
}, {
  timestamps: true
});

// Ensure only uvuId or uofuId exists based on tenant
logSchema.pre('save', function(next) {
  if (this.tenant === 'UVU' && !this.uvuId) {
    return next(new Error('UVU logs must have a uvuId'));
  }
  if (this.tenant === 'UofU' && !this.uofuId) {
    return next(new Error('UofU logs must have a uofuId'));
  }
  if (this.uvuId && this.uofuId) {
    return next(new Error('Logs cannot have both uvuId and uofuId'));
  }
  next();
});

// Add indexes for better query performance
logSchema.index({ tenant: 1, courseId: 1 });
logSchema.index({ tenant: 1, uvuId: 1 });
logSchema.index({ tenant: 1, uofuId: 1 });

export const Log = mongoose.model('Log', logSchema);