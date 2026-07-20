import mongoose from "mongoose";

const downloadSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    videoTitle: { type: String, default: "" },
    videoThumbnail: { type: String, default: "" },
    downloadedAt: { type: Date, default: Date.now },
    plan: { type: String, enum: ["free", "premium", "vip"], default: "free" },
  },
  { timestamps: true }
);

export default mongoose.model("Download", downloadSchema);