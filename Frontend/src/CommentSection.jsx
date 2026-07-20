import { useEffect, useState } from "react";
import {
  getComments,
  postComment,
  likeComment,
  dislikeComment,
  reportComment,
  deleteComment,
} from "./api";
import { useAuth } from "./AuthContext.js";
import "./CommentSection.css";

// ---- Helpers ----

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return new Date(date).toLocaleDateString("en-IN");
};

// Common language options for the translate dropdown.
// Extend this list as needed.
const LANGUAGE_OPTIONS = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "bn", label: "Bengali" },
  { code: "ar", label: "Arabic" },
  { code: "ja", label: "Japanese" },
];

// Reads user's saved preferred language, falling back to browser locale, then English.
const getDefaultTargetLang = (user) => {
  if (user?.preferredLanguage) return user.preferredLanguage;
  const browserLang = navigator.language?.split("-")[0];
  const match = LANGUAGE_OPTIONS.find((l) => l.code === browserLang);
  return match ? match.code : "en";
};

const translateText = async (text, targetLang) => {
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        text
      )}&langpair=auto|${targetLang}`
    );
    const data = await res.json();
    if (!data?.responseData?.translatedText) {
      throw new Error("empty translation");
    }
    return data.responseData.translatedText;
  } catch {
    return null; // caller shows an error state instead of fake text
  }
};

function CommentSection({ videoId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [translatedComments, setTranslatedComments] = useState({});
  const [translatingId, setTranslatingId] = useState(null);
  const [showLocation, setShowLocation] = useState(false);
  const [targetLang, setTargetLang] = useState(() => getDefaultTargetLang(user));
  const [votingId, setVotingId] = useState(null); // prevents double-click spam per comment

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getComments(videoId);
        setComments(res.data);
      } catch {
        setError("Could not load comments right now.");
      }
    };
    load();
  }, [videoId]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setError("");
    setLoading(true);

    try {
      // NOTE: no "country: India" hardcode anymore.
      // City/state should come from the user's stored profile location
      // (captured during signup / OTP device-check flow, see backend).
      // The backend decides what to attach — frontend only sends the
      // user's *choice* to display it or not.
      const res = await postComment({
        videoId,
        text,
        showLocation,
      });
      setComments([res.data, ...comments]);
      setText("");
    } catch (err) {
   
      setError(err.response?.data?.message || "Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id) => {
    if (votingId) return;
    setVotingId(id);
    try {
      const res = await likeComment(id);
      setComments(comments.map((c) => (c._id === id ? res.data : c)));
    } catch {
      setError("Could not register your like. Try again.");
    } finally {
      setVotingId(null);
    }
  };

  const handleDislike = async (id) => {
    if (votingId) return;
    setVotingId(id);
    try {
      const res = await dislikeComment(id);
      setComments(comments.map((c) => (c._id === id ? res.data : c)));
    } catch {
      setError("Could not register your dislike. Try again.");
    } finally {
      setVotingId(null);
    }
  };

  const handleReport = async (id) => {
    try {
      const res = await reportComment(id);
      // Backend returns updated comment (with isFlagged possibly true now)
      setComments(comments.map((c) => (c._id === id ? res.data : c)));
      alert("Comment reported. Our team will review it.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to report");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await deleteComment(id);
      setComments(comments.filter((c) => c._id !== id));
    } catch {
      setError("Could not delete comment. Try again.");
    }
  };

  const handleTranslate = async (id, commentText) => {
    if (translatedComments[id]) {
      setTranslatedComments((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      return;
    }

    setTranslatingId(id);
    const translated = await translateText(commentText, targetLang);
    if (translated) {
      setTranslatedComments((prev) => ({ ...prev, [id]: translated }));
    } else {
      setTranslatedComments((prev) => ({
        ...prev,
        [id]: "⚠️ Translation unavailable right now.",
      }));
    }
    setTranslatingId(null);
  };

  return (
    <div className="comment-section">
      <div className="comment-section-header">
        <h3 className="comment-count">{comments.length} Comments</h3>

        {/* Preferred translate-to language, applies to all comments */}
        <select
          className="language-select"
          value={targetLang}
          onChange={(e) => {
            setTargetLang(e.target.value);
            setTranslatedComments({}); // clear stale translations on language change
          }}
          title="Translate comments into"
        >
          {LANGUAGE_OPTIONS.map((lang) => (
            <option key={lang.code} value={lang.code}>
              Translate to: {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* Post comment */}
      {user ? (
        <form className="comment-form" onSubmit={handlePost}>
          <div className="comment-input-row">
            <div className="comment-avatar-circle">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="comment-input-wrapper">
              <input
                type="text"
                placeholder="Add a comment..."
                className="comment-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={500}
              />
              <div className="comment-options">
                <label className="location-toggle">
                  <input
                    type="checkbox"
                    checked={showLocation}
                    onChange={(e) => setShowLocation(e.target.checked)}
                  />
                  Show my city
                </label>
                <button
                  type="submit"
                  className="comment-submit-btn"
                  disabled={loading || !text.trim()}
                >
                  {loading ? "Posting..." : "Comment"}
                </button>
              </div>
            </div>
          </div>
          {error && <p className="comment-error">{error}</p>}
        </form>
      ) : (
        <p className="comment-login-msg">
          <a href="/login">Log in</a> to post a comment
        </p>
      )}

      {/* Comments list */}
      <div className="comments-list">
        {comments.map((comment) => {
          // Backend is expected to return these two booleans per comment,
          // computed against the logged-in user (see backend notes).
          const iLiked = comment.likedByMe === true;
          const iDisliked = comment.dislikedByMe === true;

          return (
            <div key={comment._id} className="comment-item">
              <div className="comment-avatar-circle">
                {comment.username.charAt(0).toUpperCase()}
              </div>

              <div className="comment-body">
                <div className="comment-header">
                  <span className="comment-username">{comment.username}</span>
                  <span className="comment-time">
                    {timeAgo(comment.createdAt)}
                  </span>
                  {/* Only city shown, never exact address/coordinates,
                      and only if the poster opted in. */}
                  {comment.showLocation && comment.city && (
                    <span className="comment-location">📍 {comment.city}</span>
                  )}
                </div>

                <p className="comment-text">{comment.text}</p>

                {translatedComments[comment._id] && (
                  <p className="comment-translated">
                    🌐 {translatedComments[comment._id]}
                  </p>
                )}

                <div className="comment-actions">
                  <button
                    className={`comment-action-btn ${iLiked ? "active" : ""}`}
                    onClick={() => handleLike(comment._id)}
                    disabled={votingId === comment._id}
                  >
                    {iLiked ? "👍" : "👍🏻"} {comment.likeCount ?? comment.likes ?? 0}
                  </button>

                  <button
                    className={`comment-action-btn ${iDisliked ? "active" : ""}`}
                    onClick={() => handleDislike(comment._id)}
                    disabled={votingId === comment._id}
                  >
                    {iDisliked ? "👎" : "👎🏻"}{" "}
                    {comment.dislikeCount ?? comment.dislikes ?? 0}
                  </button>

                  <button
                    className="comment-action-btn translate-btn"
                    onClick={() => handleTranslate(comment._id, comment.text)}
                    disabled={translatingId === comment._id}
                  >
                    {translatingId === comment._id
                      ? "Translating..."
                      : translatedComments[comment._id]
                      ? "Hide translation"
                      : "Translate"}
                  </button>

                  {!comment.reportedByMe ? (
                    <button
                      className="comment-action-btn report-btn"
                      onClick={() => handleReport(comment._id)}
                    >
                      🚩 Report
                    </button>
                  ) : (
                    <span className="comment-action-btn reported-label">
                      🚩 Reported
                    </span>
                  )}

                  {user && user._id === comment.user && (
                    <button
                      className="comment-action-btn delete-btn"
                      onClick={() => handleDelete(comment._id)}
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>

                {comment.isFlagged && (
                  <p className="comment-flagged">
                    ⚠️ This comment has been reported and is under review
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {comments.length === 0 && (
          <p className="no-comments">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
}

export default CommentSection;