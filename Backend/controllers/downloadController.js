import Download from "../models/Download.js";
import Video from "../models/Video.js";
import User from "../models/User.js";

// Download limits per plan
const LIMITS = {
  free: 1,
  premium: 10,
  vip: 999,
};

// Request a download
export const requestDownload = async (req, res) => {
  try {
    const { videoId } = req.body;

    // Get user with plan
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const plan = user.plan || "free";
    const limit = LIMITS[plan];

    // Count today's downloads for this user
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayDownloads = await Download.countDocuments({
      user: req.user.id,
      downloadedAt: { $gte: startOfDay },
    });

    if (todayDownloads >= limit) {
      return res.status(403).json({
        message:
          plan === "free"
            ? "Daily download limit reached. Upgrade to premium for more downloads!"
            : "Daily download limit reached.",
        limit,
        used: todayDownloads,
      });
    }

    // Get video details
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Record the download
    const download = await Download.create({
      user: req.user.id,
      video: videoId,
      videoTitle: video.title,
      videoThumbnail: video.thumbnail,
      plan,
    });

    res.status(201).json({
      message: "Download recorded successfully",
      download,
      remaining: limit - (todayDownloads + 1),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get current user's download history
export const getMyDownloads = async (req, res) => {
  try {
    const downloads = await Download.find({ user: req.user.id })
      .populate("video", "title thumbnail videoUrl")
      .sort({ downloadedAt: -1 });

    res.json(downloads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get remaining downloads for today
export const getRemainingDownloads = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const plan = user.plan || "free";
    const limit = LIMITS[plan];

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayDownloads = await Download.countDocuments({
      user: req.user.id,
      downloadedAt: { $gte: startOfDay },
    });

    res.json({
      plan,
      limit,
      used: todayDownloads,
      remaining: Math.max(0, limit - todayDownloads),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};