const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    isAdmin: { type: Boolean, default: false }, // Admin flag
  },
  { timestamps: true }
);

module.exports = model("User", UserSchema);
