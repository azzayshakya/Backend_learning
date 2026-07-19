const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // creates a unique index — fast lookup + prevents duplicate signups
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false, // never returned by default on .find()/.findOne() — must opt in with .select("+password")
    },
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
    isBlocked: {
      type: Boolean,
      default: false, // persisted source of truth; Redis "blocked_user:*" key is the fast-path cache of this
    },
  },
  { timestamps: true }, // adds createdAt / updatedAt automatically
);

// ── Auto-hash password before saving ────────────────────────────────
// Runs on User.create() AND user.save() — so no code path can accidentally
// save a plaintext password, regardless of which controller touches it.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});
// ── Instance method: compare a plaintext candidate against the stored hash ──
// Keeps bcrypt logic out of controllers — controllers just call user.comparePassword(pw).
userSchema.methods.comparePassword = async function comparePassword(
  candidatePassword,
) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
