import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getVideoById,
  getVideos,
  createRoom,
  requestDownload,
  getRemainingDownloads,
  toggleSubscribe, // NEW
} from "./api";
import { useAuth } from "./AuthContext.js"; // NEW: need current user id to check subscribed status
import { useNotifications } from "./context/NotificationContext.js"; // NEW
import VideoPlayer from "./VideoPlayer";
import CommentSection from "./CommentSection";
import "./VideoPage.css";

function VideoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // NEW
  const { addNotification } = useNotifications(); // NEW
  const [video, setVideo] = useState(null);
  const [error, setError] = useState("");
  const [downloadMsg, setDownloadMsg] = useState("");
  const [remaining, setRemaining] = useState(null);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [subscribed, setSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0); //  real count from backend
  const [subscribeLoading, setSubscribeLoading] = useState(false); // prevent double-click spam

  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0); //  track dislike count too
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false); //  track dislike state

  const [prevId, setPrevId] = useState(id);
  if (id !== prevId) {
    setPrevId(id);
    setLiked(false);
    setDisliked(false);
  }

  useEffect(() => {
    const loadVideo = async () => {
      try {
        const res = await getVideoById(id);
        setVideo(res.data);
        setLikes(res.data.likes || 0);
        setDislikes(res.data.dislikes || 0); // NEW

        // NEW: derive real subscribed state + count from the channel's
        // subscribers array (now an array of user IDs on the backend),
        // instead of always starting from false/0.
        const channelSubscribers = res.data.channel?.subscribers || [];
        setSubscriberCount(channelSubscribers.length);
        if (user) {
          const iAmSubscribed = channelSubscribers.some(
            (subId) => subId.toString() === user._id
          );
          setSubscribed(iAmSubscribed);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Video not found");
      }
    };

    const loadRemaining = async () => {
      try {
        const res = await getRemainingDownloads();
        setRemaining(res.data.remaining);
      } catch {
        // not logged in — ignore
      }
    };

    const loadRecommended = async () => {
      try {
        const res = await getVideos();
        setRecommendedVideos(res.data.filter((v) => v._id !== id));
      } catch {
        // ignore
      }
    };

    loadVideo();
    loadRemaining();
    loadRecommended();
  }, [id, user]);

  const getYoutubeId = (url) => {
    if (!url) return "";
    if (!url.includes("/") && !url.includes("?")) return url;
    const match = url.match(/(?:youtu\.be\/|v=|embed\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : url;
  };

  const isRealVideo = (url) => {
    return (
      url &&
      (url.includes("cloudinary") ||
        url.includes(".mp4") ||
        url.includes(".webm") ||
        url.includes("res.cloudinary"))
    );
  };

  // FIX: like and dislike are now mutually exclusive —
  // liking removes an existing dislike, and vice versa.
  const handleLike = () => {
    if (liked) {
      setLikes((prev) => prev - 1);
      setLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setLiked(true);
      if (disliked) {
        setDislikes((prev) => prev - 1);
        setDisliked(false);
      }
    }
  };

  // NEW: dislike handler — this didn't exist before, which is why the
  // 👎 button did nothing when clicked.
  const handleDislike = () => {
    if (disliked) {
      setDislikes((prev) => prev - 1);
      setDisliked(false);
    } else {
      setDislikes((prev) => prev + 1);
      setDisliked(true);
      if (liked) {
        setLikes((prev) => prev - 1);
        setLiked(false);
      }
    }
  };

  // FIXED: real subscribe/unsubscribe — calls backend, updates count from
  // the server's response (source of truth), not a local guess.
  // Added a guard for video.channel being null/undefined so the
  // subscribe click never silently crashes before the request is sent.
  const handleSubscribeToggle = async () => {
    if (!user) {
      alert("Please log in to subscribe.");
      return;
    }

    // GUARD: some videos may have a broken/missing channel reference
    // (e.g. the uploading account was deleted, or channel was never set).
    // Without this check, video.channel._id below throws a silent
    // ReferenceError/TypeError before any network request is made,
    // which is what was causing "Failed to update subscription" with
    // nothing showing up in the Network tab.
    if (!video.channel || !video.channel._id) {
      alert("Unable to subscribe — channel information is unavailable for this video.");
      return;
    }

    if (subscribeLoading) return;

    setSubscribeLoading(true);
    try {
      const res = await toggleSubscribe(video.channel._id);
      setSubscribed(res.data.subscribed);
      setSubscriberCount(res.data.subscriberCount);

      // NEW: fire a notification only when subscribing (not on unsubscribe)
      if (res.data.subscribed) {
        const channelName = video.channel?.channelName || video.channel?.username;
        addNotification(`You subscribed to ${channelName}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update subscription");
    } finally {
      setSubscribeLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  const handleStartWatchParty = async () => {
    try {
      const youtubeId = getYoutubeId(video.videoUrl);
      const res = await createRoom({
        videoId: video._id,
        videoTitle: video.title,
        videoThumbnail: video.thumbnail,
        youtubeId: youtubeId,
      });
      navigate(`/watch-party/${res.data.roomId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to start watch party. Are you logged in?");
    }
  };

  const handleDownload = async () => {
    try {
      const res = await requestDownload({ videoId: video._id });
      setRemaining(res.data.remaining);
      setDownloadMsg(
        `✅ Download recorded! ${res.data.remaining} downloads remaining today.`
      );
      window.open(
        `https://www.youtube.com/watch?v=${getYoutubeId(video.videoUrl)}`,
        "_blank"
      );
      setTimeout(() => setDownloadMsg(""), 4000);
    } catch (err) {
      const msg = err.response?.data?.message || "Download failed";
      setDownloadMsg(`❌ ${msg}`);
      setTimeout(() => setDownloadMsg(""), 4000);
    }
  };

  if (error) {
    return <p style={{ padding: "40px", color: "var(--text)" }}>{error}</p>;
  }

  if (!video) {
    return <p style={{ padding: "40px", color: "var(--text)" }}>Loading video...</p>;
  }

  const youtubeId = getYoutubeId(video.videoUrl);
  const nextVideo = recommendedVideos[0] || null;

  return (
    <div className="video-page">
      <div className="video-main">
        {/* Video Player */}
        <div className="video-player-wrapper">
          {isRealVideo(video.videoUrl) ? (
            <VideoPlayer
              src={video.videoUrl}
              nextVideo={nextVideo}
              onEnded={() => {
                if (nextVideo) navigate(`/video/${nextVideo._id}`);
              }}
            />
          ) : (
            <iframe
              className="video-player"
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          )}
        </div>

        <h1 className="video-page-title">{video.title}</h1>

        {downloadMsg && (
          <p
            className={`download-msg ${
              downloadMsg.startsWith("✅") ? "success" : "error"
            }`}
          >
            {downloadMsg}
          </p>
        )}

        <div className="video-page-meta">
          <div className="channel-info">
            <div className="channel-avatar"></div>
            <div>
              <Link
                to={`/channel/${video.channel?.username}`}
                className="channel-name"
              >
                {video.channel?.channelName || video.channel?.username}
              </Link>
              <p className="channel-subs">
                {subscriberCount} subscribers
              </p>
            </div>

            {/* Only render the button if this video actually has a valid
                channel reference — avoids showing a button that can
                never succeed. */}
            {video.channel?._id && (
              <button
                className={`subscribe-btn ${subscribed ? "subscribed" : ""}`}
                onClick={handleSubscribeToggle}
                disabled={subscribeLoading}
              >
                {subscribed ? "Subscribed" : "Subscribe"}
              </button>
            )}
          </div>

          <div className="video-actions">
            <button
              className={`action-btn ${liked ? "liked" : ""}`}
              onClick={handleLike}
            >
              👍 {likes}
            </button>

            {/* FIX: onClick + dislike count + active state added.
                Previously this button had no handler at all. */}
            <button
              className={`action-btn ${disliked ? "disliked" : ""}`}
              onClick={handleDislike}
            >
              👎 {dislikes > 0 ? dislikes : ""}
            </button>

            <button className="action-btn" onClick={handleShare}>
              ↗ Share
            </button>
            <button className="action-btn" onClick={handleDownload}>
              ⬇ Download {remaining !== null ? `(${remaining} left)` : ""}
            </button>
            <button
              className="action-btn watch-party-btn"
              onClick={handleStartWatchParty}
            >
              🎉 Watch Party
            </button>
          </div>
        </div>

        <div className="video-description">
          <p>{video.views} views</p>
          <p>{video.description}</p>
        </div>

        {/* Real Comment Section */}
        <CommentSection videoId={video._id} />
      </div>

      {/* Sidebar — recommended videos */}
      <div className="video-sidebar">
        {recommendedVideos.length === 0 ? (
          <p className="empty-tab-message">More videos coming soon.</p>
        ) : (
          recommendedVideos.map((rec) => (
            <div
              key={rec._id}
              className="rec-card"
              onClick={() => navigate(`/video/${rec._id}`)}
            >
              <img src={rec.thumbnail} alt={rec.title} className="rec-thumbnail" />
              <div className="rec-info">
                <h4 className="rec-title">{rec.title}</h4>
                <p className="rec-channel">
                  {rec.channel?.channelName || rec.channel?.username}
                </p>
                <p className="rec-meta">{rec.views} views</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default VideoPage;