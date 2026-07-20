import express from "express";
import { createRoom, getRoom, joinRoom, leaveRoom } from "../controllers/roomController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createRoom);
router.get("/:roomId", getRoom);
router.post("/:roomId/join", protect, joinRoom);
router.delete("/:roomId/leave", protect, leaveRoom);

export default router;