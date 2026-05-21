// models/LoginAttempt.js
const mongoose = require('mongoose');

const loginAttemptSchema = new mongoose.Schema({
  email: {
    type: String,
    index: true
  },
  ip: {
    type: String,
    required: true,
    index: true
  },
  userAgent: String,
  success: {
    type: Boolean,
    required: true
  },
  provider: {
    type: String,
    enum: ['google', 'local'],
    required: true
  },
  failureReason: String,      // 'invalid_credentials', 'account_suspended', etc.
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 * 30       // Keep 30 days for security audit
  }
});

// Rate limiting helper index
loginAttemptSchema.index({ ip: 1, createdAt: -1 });
loginAttemptSchema.index({ email: 1, success: 1, createdAt: -1 });

module.exports = mongoose.model('LoginAttempt', loginAttemptSchema);