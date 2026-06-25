const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    isAdmin: { type: Boolean, default: false }, // Admin flag
    role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' }, // Role flag
    tenantId: { type: String, default: "550e8400-e29b-41d4-a716-446655440000" }, // Tenant UUID
    preferences: { type: Schema.Types.Mixed, default: {} } // User preferences mapping
  },
  { timestamps: true }
);

module.exports = model("User", UserSchema);
