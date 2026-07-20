import express from "express";
import {
  register,
  login,
  getProfile,
  getUserByUsername,
  verifyOTP,
  updateTheme,
  updateAvatar,
  googleAuth,
  toggleSubscribe, // NEW
} from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";
import { uploadThumbnail } from "../middleware/upload.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.get("/profile", protect, getProfile);
router.put("/theme", protect, updateTheme);
router.put("/avatar", protect, uploadThumbnail.single("avatar"), updateAvatar);
router.get("/user/:username", getUserByUsername);
router.post("/google", googleAuth);
router.put("/subscribe/:channelId", protect, toggleSubscribe); // NEW

export default router;