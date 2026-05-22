// models/Item.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  // ─── Core Item Info ─────────────────────────────
  itemName: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [100, 'Item name cannot exceed 100 characters'],
    index: true
  },

  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },

  category: {
    type: String,
    required: true,
    enum: [
      'electronics', 'jewelry', 'wallet', 'keys', 'documents',
      'clothing', 'bag', 'pet', 'accessories', 'other'
    ],
    index: true
  },

  // ─── Report Type ────────────────────────────────
  reportType: {
    type: String,
    required: true,
    enum: ['lost', 'found'],
    index: true
  },

  // ─── Status Lifecycle ───────────────────────────
  status: {
    type: String,
    enum: ['active', 'claimed', 'resolved', 'expired'],
    default: 'active',
    index: true
  },

  // ─── Reporter / Claimant ────────────────────────
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Person who claims the item (populated when status becomes 'claimed')
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // ─── Location Info ──────────────────────────────
  location: {
    address: {
      type: String,
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [50, 'City cannot exceed 50 characters']
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      }
    },
    landmark: {
      type: String,
      trim: true,
      maxlength: [100, 'Landmark cannot exceed 100 characters']
    }
  },

  // ─── Date Fields ────────────────────────────────
  dateFoundOrLost: {
    type: Date,
    required: [true, 'Date when item was lost or found is required']
  },

  datePosted: {
    type: Date,
    default: Date.now,
    immutable: true,
    index: true
  },

  dateClaimed: {
    type: Date,
    default: null
  },

  dateResolved: {
    type: Date,
    default: null
  },

  // ─── Images ─────────────────────────────────────
  itemImages: [{
    url: {
      type: String,
      required: true
    },
    publicId: String,        // Cloudinary / S3 key for deletion
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],

  // Optional: image of the person reporting (for verification/trust)
  reporterImage: {
    url: String,
    publicId: String
  },

  // ─── Contact & Verification ─────────────────────
  contactPreference: {
    type: String,
    enum: ['in-app', 'email', 'phone', 'any'],
    default: 'in-app'
  },

  // Secret question/answer for claiming (e.g., "What color is the wallet lining?")
  verificationQuestion: {
    question: {
      type: String,
      trim: true,
      maxlength: [200, 'Question cannot exceed 200 characters']
    },
    answerHash: {
      type: String,
      select: false  // Never returned in queries
    }
  },

  // ─── Fresh List (24h visibility) ────────────────
  isFresh: {
    type: Boolean,
    default: true,
    index: true
  },

  freshExpiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // +24 hours
    },
    index: true
  },

  // ─── Engagement ─────────────────────────────────
  views: {
    type: Number,
    default: 0
  },

  // In-app messages / comments thread
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    }
  }],

  // ─── Admin / Moderation ─────────────────────────
  isFlagged: {
    type: Boolean,
    default: false
  },

  flagReason: {
    type: String,
    trim: true
  },

  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // ─── Metadata ───────────────────────────────────
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

// Geo index for location-based queries
itemSchema.index({ 'location.coordinates': '2dsphere' });

// Compound: active + fresh (for fresh list queries)
itemSchema.index({ isFresh: 1, status: 1, datePosted: -1 });

// Compound: report type + category + status
itemSchema.index({ reportType: 1, category: 1, status: 1 });

// Compound: reportedBy + status
itemSchema.index({ reportedBy: 1, status: 1 });

// ==================== VIRTUALS ====================

// Primary image URL (first image or placeholder)
itemSchema.virtual('primaryImageUrl').get(function() {
  const primary = this.itemImages.find(img => img.isPrimary);
  if (primary) return primary.url;
  if (this.itemImages.length > 0) return this.itemImages[0].url;
  return `https://via.placeholder.com/400x300?text=No+Image`;
});

// Time remaining in fresh list (in hours)
itemSchema.virtual('freshHoursRemaining').get(function() {
  if (!this.isFresh || !this.freshExpiresAt) return 0;
  const diff = this.freshExpiresAt - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60)));
});

// Reporter display info (populated from User)
itemSchema.virtual('reporterInfo', {
  ref: 'User',
  localField: 'reportedBy',
  foreignField: '_id',
  justOne: true,
  options: { select: 'profile.displayName profile.avatar email' }
});

// ==================== MIDDLEWARE ====================

// Pre-save: Auto-update isFresh based on expiration
itemSchema.pre('save', function(next) {
  if (this.isFresh && this.freshExpiresAt && new Date() > this.freshExpiresAt) {
    this.isFresh = false;
  }
  next();
});

// ==================== STATIC METHODS ====================

// Get fresh items (24h list) - auto-expires stale ones
itemSchema.statics.getFreshList = async function(filters = {}) {
  const now = new Date();

  // First: bulk expire any items whose time is up
  await this.updateMany(
    { isFresh: true, freshExpiresAt: { $lt: now } },
    { $set: { isFresh: false } }
  );

  // Then: return current fresh items with optional filters
  const query = {
    isFresh: true,
    status: 'active',
    ...filters
  };

  return this.find(query)
    .sort({ datePosted: -1 })
    .populate('reportedBy', 'profile.displayName profile.avatar email')
    .lean();
};

// Get items near a location (geo query)
itemSchema.statics.findNearby = function(coords, maxDistance = 5000, filters = {}) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coords // [lng, lat]
        },
        $maxDistance: maxDistance // meters
      }
    },
    status: 'active',
    ...filters
  }).populate('reportedBy', 'profile.displayName profile.avatar');
};

// Search items by name/description
itemSchema.statics.search = function(searchTerm, filters = {}) {
  return this.find({
    $text: { $search: searchTerm },
    status: 'active',
    ...filters
  }).sort({ score: { $meta: 'textScore' } });
};

// ==================== INSTANCE METHODS ====================

// Mark item as claimed
itemSchema.methods.markClaimed = async function(claimerId) {
  this.status = 'claimed';
  this.claimedBy = claimerId;
  this.dateClaimed = new Date();
  this.isFresh = false;
  return this.save();
};

// Mark item as resolved (handed over successfully)
itemSchema.methods.markResolved = async function() {
  this.status = 'resolved';
  this.dateResolved = new Date();
  return this.save();
};

// Add a message to the thread
itemSchema.methods.addMessage = function(senderId, content) {
  this.messages.push({
    sender: senderId,
    content,
    createdAt: new Date()
  });
  return this.save();
};

// Increment view count
itemSchema.methods.incrementViews = function() {
  return this.updateOne({ $inc: { views: 1 } });
};

// Check if verification answer matches (for claiming)
itemSchema.methods.verifyAnswer = async function(answer) {
  if (!this.verificationQuestion?.answerHash) return true; // No verification needed
  const bcrypt = require('bcryptjs');
  return bcrypt.compare(answer, this.verificationQuestion.answerHash);
};

// Set verification answer (hashed)
itemSchema.methods.setVerificationAnswer = async function(answer) {
  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  this.verificationQuestion.answerHash = await bcrypt.hash(answer, salt);
  return this.save();
};

module.exports = mongoose.model('Item', itemSchema);