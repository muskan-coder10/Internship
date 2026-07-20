import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyDownloads, getRemainingDownloads } from "./api";
import "./DownloadsPage.css";

function DownloadsPage() {
  const [downloads, setDownloads] = useState([]);
  const [remaining, setRemaining] = useState(null);
  const [planInfo, setPlanInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [downloadsRes, remainingRes] = await Promise.all([
          getMyDownloads(),
          getRemainingDownloads(),
        ]);
        setDownloads(downloadsRes.data);
        setRemaining(remainingRes.data.remaining);
        setPlanInfo(remainingRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load downloads");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <p className="downloads-status">Loading downloads...</p>;
  if (error) return <p className="downloads-status">{error}</p>;

  return (
    <div className="downloads-page">
      <div className="downloads-header">
        <h2 className="downloads-title">Downloads</h2>
        <div className="downloads-plan-badge">
          <span className={`plan-badge ${planInfo?.plan}`}>
            {planInfo?.plan?.toUpperCase()} Plan
          </span>
          <span className="downloads-remaining">
            {remaining} / {planInfo?.limit} downloads remaining today
          </span>
        </div>
      </div>

      {planInfo?.plan === "free" && (
        <div className="upgrade-banner">
          <p>⚡ You are on the Free plan — <strong>1 download per day</strong>. Upgrade to Premium for more!</p>
          <button className="upgrade-btn">Upgrade to Premium</button>
        </div>
      )}

      {downloads.length === 0 ? (
        <div className="downloads-empty">
          <p>No downloads yet.</p>
          <Link to="/" className="browse-link">Browse videos to download</Link>
        </div>
      ) : (
        <div className="downloads-list">
          {downloads.map((download) => (
            <Link
              to={`/video/${download.video?._id}`}
              key={download._id}
              className="download-card"
            >
              <img
                src={download.videoThumbnail || "https://placehold.co/168x94"}
                alt={download.videoTitle}
                className="download-thumbnail"
              />
              <div className="download-info">
                <h4 className="download-title">{download.videoTitle}</h4>
                <p className="download-meta">
                  Downloaded on{" "}
                  {new Date(download.downloadedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <span className={`download-plan-tag ${download.plan}`}>
                  {download.plan}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default DownloadsPage;