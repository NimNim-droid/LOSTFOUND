// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Core Identity
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },

  // Google OAuth Profile
  google: {
    id: {
      type: String,
      unique: true,
      sparse: true, // Allows null for non-OAuth users if you add email/pass later
      index: true
    },
    displayName: String,
    givenName: String,
    familyName: String,
    picture: String,          // Google profile photo URL
    locale: String,           // e.g., "en", "zh-CN"
    verifiedEmail: {
      type: Boolean,
      default: false
    }
  },

  // Auth Strategy Tracking
  authProvider: {
    type: String,
    enum: ['google', 'local', 'both'],
    default: 'google',
    required: true
  },

  // Local Auth (optional - for future email/password addition)
  local: {
    passwordHash: {
      type: String,
      select: false  // Never returned in queries by default
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
  },

  // Profile Info (denormalized from Google + editable by user)
  profile: {
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: [100, 'Display name cannot exceed 100 characters']
    },
    avatar: {
      url: String,            // Your CDN/Storage URL (overrides Google picture)
      isCustom: {
        type: Boolean,
        default: false
      }
    },
    phone: {
      type: String,
      trim: true
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },

  // Role-Based Access Control
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user',
    index: true
  },

  // Account Status
  status: {
    type: String,
    enum: ['active', 'suspended', 'deactivated', 'pending'],
    default: 'active',
    index: true
  },

  // Security & Tracking
  lastLogin: {
    type: Date,
    default: Date.now
  },
  lastLoginIp: String,
  loginCount: {
    type: Number,
    default: 0
  },

  // OAuth Token Management (for Google API access if needed)
  oauthTokens: {
    accessToken: {
      type: String,
      select: false
    },
    refreshToken: {
      type: String,
      select: false
    },
    expiresAt: Date,
    scope: [String]          // e.g., ['profile', 'email', 'https://www.googleapis.com/auth/calendar']
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ==================== INDEXES ====================

// Compound index for common queries
userSchema.index({ status: 1, role: 1 });
userSchema.index({ 'google.id': 1, status: 1 });

// ==================== VIRTUALS ====================

// Full name helper
userSchema.virtual('fullName').get(function() {
  if (this.profile.displayName) return this.profile.displayName;
  const first = this.profile.firstName || this.google?.givenName || '';
  const last = this.profile.lastName || this.google?.familyName || '';
  return `${first} ${last}`.trim() || 'Anonymous';
});

// Active avatar URL (custom > Google > default)
userSchema.virtual('avatarUrl').get(function() {
  if (this.profile.avatar?.url) return this.profile.avatar.url;
  if (this.google?.picture) return this.google.picture;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.fullName)}&background=random`;
});

// ==================== MIDDLEWARE ====================

// Pre-save: Sync display name from Google if not set
userSchema.pre('save', function(next) {
  if (this.isNew && this.google?.displayName && !this.profile.displayName) {
    this.profile.displayName = this.google.displayName;
  }
  if (this.isNew && this.google?.givenName && !this.profile.firstName) {
    this.profile.firstName = this.google.givenName;
  }
  if (this.isNew && this.google?.familyName && !this.profile.lastName) {
    this.profile.lastName = this.google.familyName;
  }
  next();
});

// ==================== STATIC METHODS ====================

// Find or create Google user (used in OAuth callback)
userSchema.statics.findOrCreateGoogleUser = async function(googleProfile, tokens) {
  const { id, emails, name, photos, displayName } = googleProfile;
  
  let user = await this.findOne({ 'google.id': id });
  
  if (user) {
    // Update existing user
    user.google.displayName = displayName || user.google.displayName;
    user.google.givenName = name?.givenName || user.google.givenName;
    user.google.familyName = name?.familyName || user.google.familyName;
    user.google.picture = photos?.[0]?.value || user.google.picture;
    user.google.verifiedEmail = emails?.[0]?.verified || false;
    
    if (tokens) {
      user.oauthTokens = {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || user.oauthTokens?.refreshToken,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
        scope: tokens.scope?.split(' ') || []
      };
    }
    
    user.lastLogin = new Date();
    user.loginCount += 1;
    
    await user.save();
    return { user, isNew: false };
  }
  
  // Create new user
  const newUser = new this({
    email: emails?.[0]?.value,
    google: {
      id,
      displayName,
      givenName: name?.givenName,
      familyName: name?.familyName,
      picture: photos?.[0]?.value,
      verifiedEmail: emails?.[0]?.verified || false
    },
    authProvider: 'google',
    profile: {
      firstName: name?.givenName,
      lastName: name?.familyName,
      displayName: displayName
    },
    lastLogin: new Date(),
    loginCount: 1
  });
  
  if (tokens) {
    newUser.oauthTokens = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
      scope: tokens.scope?.split(' ') || []
    };
  }
  
  await newUser.save();
  return { user: newUser, isNew: true };
};

// ==================== INSTANCE METHODS ====================

// Check if OAuth token needs refresh
userSchema.methods.isTokenExpired = function() {
  if (!this.oauthTokens?.expiresAt) return true;
  return new Date() >= this.oauthTokens.expiresAt;
};

// Safe user object for JWT payload
userSchema.methods.toAuthJSON = function() {
  return {
    id: this._id,
    email: this.email,
    fullName: this.fullName,
    avatarUrl: this.avatarUrl,
    role: this.role,
    status: this.status,
    authProvider: this.authProvider
  };
};

module.exports = mongoose.model('User', userSchema);