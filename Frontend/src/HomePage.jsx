import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getVideos } from "./api";
import "./HomePage.css";

function HomePage() {
  const categories = [
    "All", "Music", "Gaming", "News", "Live", "React", "JavaScript",
    "Podcasts", "Movies", "Sports", "Cooking", "Technology", "Recently Uploaded", "Watched",
  ];

  const [videos, setVideos] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const res = await getVideos({ category: activeCategory });
        setVideos(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadVideos();
  }, [activeCategory]);

  return (
    <div className="homepage">
      <div className="category-bar">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-btn ${activeCategory === category ? "active" : ""}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="video-grid">
        {videos.length === 0 && <p style={{ padding: "20px" }}>No videos yet. Be the first to upload!</p>}
        {videos.map((video) => (
          <Link to={`/video/${video._id}`} key={video._id} className="video-card">
            <img src={video.thumbnail} alt={video.title} className="video-thumbnail" />
            <div className="video-info">
              {/* Circular channel avatar, like the real YouTube app.
                  Falls back to the first letter of the channel name
                  when there's no avatar image. */}
              <div className="video-card-avatar">
                {video.channel?.avatar ? (
                  <img src={video.channel.avatar} alt="" />
                ) : (
                  <span>
                    {(video.channel?.channelName || video.channel?.username || "?")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
              </div>
              <div className="video-info-text">
                <h3 className="video-title">{video.title}</h3>
                <p className="video-channel">
                  {video.channel?.channelName || video.channel?.username}
                </p>
                <p className="video-meta">{video.views} views</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default HomePage;