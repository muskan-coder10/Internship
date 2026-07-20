import { Link } from "react-router-dom";
import "./WatchLaterPage.css";

function WatchLaterPage() {
  const watchLater = [
    {
      id: 3,
      thumbnail: "https://placehold.co/168x94",
      title: "Cooking Pasta Like a Pro",
      channel: "Kitchen Tales",
      views: "430K views",
      time: "3 days ago",
    },
    {
      id: 5,
      thumbnail: "https://placehold.co/168x94",
      title: "Sports Highlights This Week",
      channel: "Sports Central",
      views: "670K views",
      time: "1 day ago",
    },
    {
      id: 6,
      thumbnail: "https://placehold.co/168x94",
      title: "Technology Trends 2026",
      channel: "Tech Today",
      views: "1.5M views",
      time: "4 days ago",
    },
  ];

  return (
    <div className="watch-later-page">
      <div className="watch-later-header">
        <h2 className="watch-later-title">Watch Later</h2>
        <p className="watch-later-count">{watchLater.length} videos</p>
      </div>

      <div className="watch-later-list">
        {watchLater.map((video) => (
          <Link
            to={`/video/${video.id}`}
            key={video.id}
            className="watch-later-card"
          >
            <img
              src={video.thumbnail}
              alt={video.title}
              className="watch-later-thumbnail"
            />
            <div className="watch-later-info">
              <h4 className="watch-later-video-title">{video.title}</h4>
              <p className="watch-later-channel">{video.channel}</p>
              <p className="watch-later-meta">
                {video.views} • {video.time}
              </p>
            </div>
            <button
              className="remove-btn"
              onClick={(e) => e.preventDefault()}
              title="Remove from Watch Later"
            >
              ✕
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default WatchLaterPage;