import express from "express";
import {
  getVideos,
  getVideoById,
  createVideo,
  getVideosByChannel,
  likeVideo,
  updateVideo,
  uploadVideoFile,
  uploadThumbnailFile,
} from "../controllers/videoController.js";
import protect from "../middleware/authMiddleware.js";
import { uploadVideo, uploadThumbnail } from "../middleware/upload.js";
import {  deleteVideo } from "../controllers/videoController.js";

const router = express.Router();

router.get("/", getVideos);
router.get("/:id", getVideoById);
router.post("/", protect, createVideo);
router.put("/:id", protect, updateVideo);
router.get("/channel/:userId", getVideosByChannel);
router.put("/:id/like", protect, likeVideo);
router.post("/upload-video", protect, uploadVideo.single("video"), uploadVideoFile);
router.post("/upload-thumbnail", protect, uploadThumbnail.single("thumbnail"), uploadThumbnailFile);
router.delete("/:id", protect, deleteVideo);

export default router;