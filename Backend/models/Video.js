import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    thumbnail: { type: String, required: true },
    videoUrl: { type: String, required: true },
    channel: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    category: { type: String, default: "All" },
  },
  { timestamps: true }
);

export default mongoose.model("Video", videoSchema);