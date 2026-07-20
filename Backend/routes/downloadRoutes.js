import express from "express";
import {
  requestDownload,
  getMyDownloads,
  getRemainingDownloads,
} from "../controllers/downloadController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, requestDownload);
router.get("/my", protect, getMyDownloads);
router.get("/remaining", protect, getRemainingDownloads);

export default router;