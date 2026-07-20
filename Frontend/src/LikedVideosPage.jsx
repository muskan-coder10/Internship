import { Link } from "react-router-dom";
import "./LikedVideosPage.css";

function LikedVideosPage() {
  const likedVideos = [
    {
      id: 1,
      thumbnail: "https://tse3.mm.bing.net/th/id/OIP.n_M0SSBQep-IzhwHoTcihwHaEK?pid=Api&P=0&h=180",
      title: "Tujh mein rab dikhta ",
      channel: "YRF",
      views: "72.2M views",
      time: "14 Years ago",
    },
    {
      id: 2,
      thumbnail: "https://tse1.mm.bing.net/th/id/OIP.9CC9BOFlqtisih0APwcmqgHaEK?pid=Api&P=0&h=180",
      title: "Lo-fi Beats to Study To",
      channel: "Chill Vibes",
      views: "850K views",
      time: "1 week ago",
    },
    {
      id: 4,
     thumbnail: "https://tse3.mm.bing.net/th/id/OIP.20hRNAJEGPar2nzvndKdJgAAAA?pid=Api&P=0&h=180",
      title: "Chand Mera dil",
      channel: "Dev Hacks",
      views: "2M views",
      time: "5 days ago",
    },
  ];

  return (
    <div className="liked-page">
      <div className="liked-header">
        <h2 className="liked-title">Liked Videos</h2>
        <p className="liked-count">{likedVideos.length} videos</p>
      </div>

      <div className="liked-list">
        {likedVideos.map((video) => (
          <Link
            to={`/video/${video.id}`}
            key={video.id}
            className="liked-card"
          >
            <img
              src={video.thumbnail}
              alt={video.title}
              className="liked-thumbnail"
            />
            <div className="liked-info">
              <h4 className="liked-video-title">{video.title}</h4>
              <p className="liked-channel">{video.channel}</p>
              <p className="liked-meta">
                {video.views} • {video.time}
              </p>
            </div>
            <button
              className="unlike-btn"
              onClick={(e) => e.preventDefault()}
              title="Remove from Liked Videos"
            >
              👍
            </button>
          </Link>
        ))}

        {likedVideos.length === 0 && (
          <p className="empty-message">No liked videos yet.</p>
        )}
      </div>
    </div>
  );
}

export default LikedVideosPage;