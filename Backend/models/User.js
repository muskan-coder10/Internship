import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "" },
    channelName: { type: String, default: "" },
    description: { type: String, default: "" },

    // FIX: subscribers changed from a plain Number counter to an array of
    // User IDs. A counter alone can only go up/down — it can't tell you
    // WHO is subscribed, so the frontend has no way to know whether the
    // currently logged-in user has already subscribed (which is why the
    // button couldn't persist/reflect real state). Storing IDs solves both
    // problems: count = subscribers.length, and "am I subscribed?" =
    // subscribers.includes(myUserId).
    subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    plan: {
      type: String,
      enum: ["free", "bronze", "silver", "gold"],
      default: "free",
    },
    planExpiry: { type: Date, default: null },
    transactionId: { type: String, default: "" },

    // ---------- Theme ----------
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "dark",
    },

    // ---------- Security ----------
    lastCity: { type: String, default: "" },
    lastState: { type: String, default: "" },
    lastDevice: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);