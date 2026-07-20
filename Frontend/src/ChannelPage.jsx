import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getUserByUsername, getVideosByChannel, updateAvatar } from "./api.js";
import { useAuth } from "./AuthContext.js";
import "./ChannelPage.css";

function ChannelPage() {
  const { username } = useParams();
  const { user, login } = useAuth();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [activeTab, setActiveTab] = useState("Videos");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef(null);

  const isOwnChannel = user?.username === username;

  useEffect(() => {
    const loadChannel = async () => {
      try {
        const res = await getUserByUsername(username);
        setChannel(res.data);

        const videoRes = await getVideosByChannel(res.data._id);
        setVideos(videoRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "Channel not found");
      }
    };

    loadChannel();
  }, [username]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarLoading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await updateAvatar(formData);

      // Update local channel display
      setChannel((prev) => ({ ...prev, avatar: res.data.avatar }));

      // Update auth context
      login({ ...user, avatar: res.data.avatar });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update avatar");
    } finally {
      setAvatarLoading(false);
    }
  };

  if (error) {
    return <p className="empty-tab-message">{error}</p>;
  }

  if (!channel) {
    return <p className="empty-tab-message">Loading channel...</p>;
  }

  const tabs = ["Videos", "Shorts", "Playlists", "About"];

  const getInitial = (name) => (name || "U").charAt(0).toUpperCase();

  return (
    <div className="channel-page">
      <div className="channel-banner">
        <img src="https://placehold.co/1200x250" alt="Channel banner" />
      </div>

      <div className="channel-header">
        {/* Avatar */}
        <div className="channel-avatar-wrapper">
          {channel.avatar ? (
            <img
              src={channel.avatar}
              alt={channel.username}
              className="channel-avatar-lg"
            />
          ) : (
            <div className="channel-avatar-initial">
              {getInitial(channel.channelName || channel.username)}
            </div>
          )}

          {/* Change avatar button — only for own channel */}
          {isOwnChannel && (
            <div>
              <button
                className="change-avatar-btn"
                onClick={() => fileInputRef.current.click()}
                disabled={avatarLoading}
              >
                {avatarLoading ? "Uploading..." : "✏️ Change"}
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />
            </div>
          )}
        </div>

        <div className="channel-details">
          <h2 className="channel-name-lg">
            {channel.channelName || channel.username}
          </h2>
          <p className="channel-handle">
            @{channel.username} • {channel.subscribers || 0} subscribers •{" "}
            {videos.length} videos
          </p>
          <p className="channel-description">
            {channel.description || "No description yet."}
          </p>
        </div>

        {!isOwnChannel && (
          <button
            className={`subscribe-btn-lg ${subscribed ? "subscribed" : ""}`}
            onClick={() => setSubscribed(!subscribed)}
          >
            {subscribed ? "Subscribed" : "Subscribe"}
          </button>
        )}
      </div>

      <div className="channel-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="channel-content">
        {activeTab === "Videos" && (
          <div className="channel-video-grid">
            {videos.length === 0 && (
              <p className="empty-tab-message">No videos uploaded yet.</p>
            )}
            {videos.map((video) => (
              <div key={video._id} className="channel-video-card">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="channel-video-thumbnail"
                />
                <h4 className="channel-video-title">{video.title}</h4>
                <p className="channel-video-meta">{video.views} views</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Shorts" && (
          <p className="empty-tab-message">No shorts uploaded yet.</p>
        )}

        {activeTab === "Playlists" && (
          <p className="empty-tab-message">No playlists yet.</p>
        )}

        {activeTab === "About" && (
          <div className="about-section">
            <p>{channel.description || "No description yet."}</p>
            <p className="about-stats">
              {channel.subscribers || 0} subscribers • {videos.length} videos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChannelPage;