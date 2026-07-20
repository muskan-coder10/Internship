import Comment from "../models/Comment.js";
import User from "../models/User.js"; // adjust path if your User model lives elsewhere
import { moderateComment } from "../utils/moderateComment.js";

const serializeComment = (comment, userId) => {
  const obj = comment.toObject ? comment.toObject() : comment;
  return {
    ...obj,
    likedByMe: userId
      ? obj.likedBy.some((id) => id.toString() === userId.toString())
      : false,
    dislikedByMe: userId
      ? obj.dislikedBy.some((id) => id.toString() === userId.toString())
      : false,
    reportedByMe: userId
      ? obj.reportedBy.some((id) => id.toString() === userId.toString())
      : false,
  };
};

// Get all comments for a video
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      video: req.params.videoId,
      isBlocked: false,
    }).sort({ createdAt: -1 });

    // FIX: req.user may not exist for logged-out visitors viewing comments —
    // handle that case instead of assuming req.user.id always exists.
    const userId = req.user?.id;
    res.json(comments.map((c) => serializeComment(c, userId)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Post a new comment
export const postComment = async (req, res) => {
  try {
    const { videoId, text, showLocation } = req.body;
    // FIX: "country" removed from destructuring — never trust location from client.

    // Moderate comment
    const moderation = await moderateComment(text, req.user.id);
    if (!moderation.allowed) {
      return res.status(400).json({ message: moderation.reason });
    }

    // FIX (new): pull city from the user's own stored profile instead of
    // trusting whatever the client sends. Anyone could otherwise fake
    // req.body.country via Postman/devtools.
    const userDoc = await User.findById(req.user.id).select("username city");
    if (!userDoc) {
      return res.status(404).json({ message: "User not found" });
    }

    const comment = await Comment.create({
      video: videoId,
      user: req.user.id,
      username: userDoc.username, // FIX: req.user only has "id", not "username" — pull it from the fetched user doc
      text: text.trim(),
      showLocation: showLocation || false,
      city: showLocation ? userDoc.city || "" : "",
    });

    res.status(201).json(serializeComment(comment, req.user.id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Like a comment
export const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const alreadyLiked = comment.likedBy.includes(req.user.id);
    const alreadyDisliked = comment.dislikedBy.includes(req.user.id);

    if (alreadyLiked) {
      // Unlike
      comment.likes -= 1;
      comment.likedBy = comment.likedBy.filter(
        (id) => id.toString() !== req.user.id
      );
    } else {
      // Like + remove dislike if exists
      comment.likes += 1;
      comment.likedBy.push(req.user.id);

      if (alreadyDisliked) {
        comment.dislikes -= 1;
        comment.dislikedBy = comment.dislikedBy.filter(
          (id) => id.toString() !== req.user.id
        );
      }
    }

    await comment.save();
    res.json(serializeComment(comment, req.user.id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Dislike a comment
export const dislikeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const alreadyDisliked = comment.dislikedBy.includes(req.user.id);
    const alreadyLiked = comment.likedBy.includes(req.user.id);

    if (alreadyDisliked) {
      // Remove dislike
      comment.dislikes -= 1;
      comment.dislikedBy = comment.dislikedBy.filter(
        (id) => id.toString() !== req.user.id
      );
    } else {
      // Dislike + remove like if exists
      comment.dislikes += 1;
      comment.dislikedBy.push(req.user.id);

      if (alreadyLiked) {
        comment.likes -= 1;
        comment.likedBy = comment.likedBy.filter(
          (id) => id.toString() !== req.user.id
        );
      }
    }

    await comment.save();
    res.json(serializeComment(comment, req.user.id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Report a comment
export const reportComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const alreadyReported = comment.reportedBy.includes(req.user.id);
    if (alreadyReported) {
      return res.status(400).json({ message: "You already reported this comment" });
    }

    comment.reportedBy.push(req.user.id);
    comment.reportCount += 1;
    comment.isReported = true;

    // Flag for admin review after 3 reports — never auto-delete.
    if (comment.reportCount >= 3) {
      comment.isFlagged = true;
    }

    await comment.save();

    // FIX: return the updated comment instead of just a message, so the
    // frontend can instantly show "Reported" / "under review" state
    // without needing a page refresh.
    res.json(serializeComment(comment, req.user.id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete own comment
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    await comment.deleteOne();
    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};