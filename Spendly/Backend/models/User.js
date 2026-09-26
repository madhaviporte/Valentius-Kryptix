const mongoose = require("mongoose");

// User model - represents a person who tracks expenses in Spendly
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
  },
  {
    // createdAt / updatedAt are added automatically
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
