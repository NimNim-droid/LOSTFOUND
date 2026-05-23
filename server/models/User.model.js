// models/user.model.js

const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Enter representative name"],
      trim: true,
    },
    phone_number: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Enter email"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Enter password"],
      minlength: 6,
    },
    location: {
      type: String,
      minlength: 4,
    },
    profile: {
      type: String,
      default: "/uploads/default-avatar.png",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;