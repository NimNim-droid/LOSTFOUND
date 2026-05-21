// models/RefreshToken.js
const mongoose = require('mongoose');
const crypto = require('crypto');

const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Device/Session tracking
  deviceInfo: {
    fingerprint: String,      // Client-generated device fingerprint
    userAgent: String,
    ip: String
  },
  // Token lifecycle
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  revokedAt: Date,
  replacedByToken: String,    // If rotated, reference to new token
  isRevoked: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 0  // MongoDB TTL - auto-delete expired tokens
  }
});

// Auto-cleanup expired tokens via TTL index above
// Additional compound index for user session lookup
refreshTokenSchema.index({ user: 1, isRevoked: 1, createdAt: -1 });

// Generate secure random token
refreshTokenSchema.statics.generateToken = function() {
  return crypto.randomBytes(64).toString('hex');
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);