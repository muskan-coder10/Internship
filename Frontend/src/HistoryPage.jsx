import { Link } from "react-router-dom";
import "./HistoryPage.css";

function HistoryPage() {
  const history = [
    {
      date: "Today",
      videos: [
        {
          id: 1,
          thumbnail: "https://tse3.mm.bing.net/th/id/OIP.n_M0SSBQep-IzhwHoTcihwHaEK?pid=Api&P=0&h=180",
          title: "Tujh mein rab dikhta h ",
          channel: "YRF",
          views: "72.2M views",
          time: "14 years ago",
        },
        
      ],
    },
    {
      date: "Yesterday",
      videos: [
        {
          id: 2,
          thumbnail: "https://tse1.mm.bing.net/th/id/OIP.9CC9BOFlqtisih0APwcmqgHaEK?pid=Api&P=0&h=180",
          title: "Lo-fi Beats to Study To",
          channel: "Chill Vibes",
          views: "850K views",
          time: "1 week ago",
        },
      ],
    },
    {
      date: "Earlier this week",
      videos: [
        {
          id: 3,
          thumbnail: "https://tse3.mm.bing.net/th/id/OIP.7Yt9bmGR6ZHVKbzPo5J_vgAAAA?pid=Api&P=0&h=180",
          title: "Khat Song",
          channel: "Music Beat",
          views: "430K views",
          time: "3 days ago",
        },
        {
          id: 6,
          thumbnail: "https://c8.alamy.com/comp/3CHTHBY/2026-business-trends-and-future-technology-innovation-futuristic-concept-of-2026-trends-with-icons-for-ai-blockchain-digital-security-robotics-3CHTHBY.jpg",
          title: "Technology Trends 2026",
          channel: "Tech Today",
          views: "1.5M views",
          time: "4 days ago",
        },
      ],
    },
  ];

  return (
    <div className="history-page">
      <div className="history-header">
        <h2 className="history-title">Watch History</h2>
        <button className="clear-history-btn">Clear all watch history</button>
      </div>

      {history.map((group) => (
        <div key={group.date} className="history-group">
          <h3 className="history-date">{group.date}</h3>

          {group.videos.map((video) => (
            <Link
              to={`/video/${video.id}`}
              key={video.id}
              className="history-card"
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                className="history-thumbnail"
              />
              <div className="history-info">
                <h4 className="history-video-title">{video.title}</h4>
                <p className="history-channel">{video.channel}</p>
                <p className="history-meta">
                  {video.views} • {video.time}
                </p>
              </div>
              <button
                className="remove-btn"
                onClick={(e) => e.preventDefault()}
                title="Remove from history"
              >
                ✕
              </button>
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}

export default HistoryPage;