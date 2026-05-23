const mongoose = require("mongoose");

const ItemSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Enter item title"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Enter item description"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Enter category"],
      enum: ["electronics", "pets", "wallets", "keys", "other"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["lost", "found", "claimed", "returned"],
      default: "lost",
    },
    location: {
      type: String,
      required: [true, "Enter location"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Enter date"],
      default: Date.now,
    },
    images: {
      type: [String],
      default: [],
    },
    // ─── RELATION TO USER ─────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Item = mongoose.model("Item", ItemSchema);
module.exports = Item;