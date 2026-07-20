import Video from "../models/Video.js";

// Get all videos (with optional category filter and search)
export const getVideos = async (req, res) => {
  try {
    const { category, search } = req.query;
    let filter = {};

    if (category && category !== "All") {
      filter.category = category;
    }

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const videos = await Video.find(filter)
      .populate("channel", "username channelName avatar")
      .sort({ createdAt: -1 });

    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single video by ID
export const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate(
      "channel",
      "username channelName avatar subscribers"
    );

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    video.views += 1;
    await video.save();

    res.json(video);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Upload/create a video
export const createVideo = async (req, res) => {
  try {
    const { title, description, thumbnail, videoUrl, category } = req.body;

    const video = await Video.create({
      title,
      description,
      thumbnail,
      videoUrl,
      category,
      channel: req.user.id,
    });

    res.status(201).json(video);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a video
export const updateVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Only owner can update
    if (video.channel.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to edit this video" });
    }

    const { title, description, thumbnail, videoUrl, category } = req.body;

    video.title = title || video.title;
    video.description = description || video.description;
    video.thumbnail = thumbnail || video.thumbnail;
    video.videoUrl = videoUrl || video.videoUrl;
    video.category = category || video.category;

    await video.save();
    res.json(video);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a video
export const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Only owner can delete
    if (video.channel.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this video" });
    }

    await video.deleteOne();
    res.json({ message: "Video deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get videos by a specific channel/user
export const getVideosByChannel = async (req, res) => {
  try {
    const videos = await Video.find({ channel: req.params.userId })
      .populate("channel", "username channelName avatar")
      .sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Like a video
export const likeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    video.likes += 1;
    await video.save();

    res.json(video);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Upload video file to Cloudinary
export const uploadVideoFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    res.json({
      url: req.file.path,
      publicId: req.file.filename,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Upload thumbnail to Cloudinary
export const uploadThumbnailFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    res.json({
      url: req.file.path,
      publicId: req.file.filename,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};