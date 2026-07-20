import express from "express";
import {
  getComments,
  postComment,
  likeComment,
  dislikeComment,
  reportComment,
  deleteComment,
} from "../controllers/commentController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:videoId", getComments);
router.post("/", protect, postComment);
router.put("/:id/like", protect, likeComment);
router.put("/:id/dislike", protect, dislikeComment);
router.post("/:id/report", protect, reportComment);
router.delete("/:id", protect, deleteComment);

export default router;