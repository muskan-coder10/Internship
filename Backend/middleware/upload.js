import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "youtube-clone/videos",
    resource_type: "video",
    allowed_formats: ["mp4", "mkv", "avi", "mov", "webm"],
  },
});

const thumbnailStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "youtube-clone/thumbnails",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

export const uploadVideo = multer({ storage: videoStorage });
export const uploadThumbnail = multer({ storage: thumbnailStorage });