import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: { type: String, required: true },
    text: { type: String, required: true, maxlength: 500 },
    language: { type: String, default: "en" },

    // FIX: task requirement is "city name", not country.
    // Value comes from the user's stored profile (see controller),
    // never trusted from the client directly.
    city: { type: String, default: "" },
    showLocation: { type: Boolean, default: false },

    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    reportCount: { type: Number, default: 0 },
    reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isReported: { type: Boolean, default: false },
    isFlagged: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Comment", commentSchema);