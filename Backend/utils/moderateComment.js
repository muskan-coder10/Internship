import Comment from "../models/Comment.js";

const BAD_WORDS = [
  "badword1", "badword2", "spam", "abuse",
  // apne bad words yahan add karo
];

export const moderateComment = async (text, userId) => {
  if (!text || !text.trim()) {
    return { allowed: false, reason: "Comment cannot be empty" };
  }

  const trimmed = text.trim();
  const lowerText = trimmed.toLowerCase();

  // Check 1 — Abusive words
  // FIX: word-boundary match instead of plain .includes(), so a word like
  // "class" or "assist" doesn't wrongly match "ass" inside BAD_WORDS.
  const hasAbusiveWord = BAD_WORDS.some((word) => {
    const pattern = new RegExp(`\\b${word}\\b`, "i");
    return pattern.test(lowerText);
  });
  if (hasAbusiveWord) {
    return { allowed: false, reason: "Comment contains abusive language" };
  }

  // Check 2 — Repeated special characters
  // FIX (new): task specifically asks for "repeated special-character comments"
  // e.g. "!!!!!!", "@@@@@@", "??????" — the old ratio check below doesn't
  // reliably catch this pattern, so we add a direct regex check for it.
  const repeatedSpecialCharPattern = /([^a-zA-Z0-9\s\u0900-\u097F])\1{3,}/;
  if (repeatedSpecialCharPattern.test(trimmed)) {
    return {
      allowed: false,
      reason: "Comment contains repeated special characters",
    };
  }

  // Check 3 — Special character spam (more than 50% special chars overall)
  const specialChars = (trimmed.match(/[^a-zA-Z0-9\s\u0900-\u097F]/g) || []).length;
  const ratio = specialChars / trimmed.length;
  if (ratio > 0.5) {
    return { allowed: false, reason: "Comment contains too many special characters" };
  }

  // Check 4 — Repeated normal character spam (e.g. "aaaaaaaaaa")
  // (new): catches non-special-char spam that Check 2/3 won't catch.
  const repeatedCharPattern = /(.)\1{6,}/;
  if (repeatedCharPattern.test(trimmed)) {
    return { allowed: false, reason: "Comment looks like spam" };
  }

  // Check 5 — Too short (less than 2 chars)
  if (trimmed.length < 2) {
    return { allowed: false, reason: "Comment is too short" };
  }

  // Check 6 — Duplicate comment (same user, same text, last 1 hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const duplicate = await Comment.findOne({
    user: userId,
    text: trimmed,
    createdAt: { $gte: oneHourAgo },
  });
  if (duplicate) {
    return { allowed: false, reason: "You already posted this comment recently" };
  }

  return { allowed: true };
};