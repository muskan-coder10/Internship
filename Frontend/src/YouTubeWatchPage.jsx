import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

function YouTubeWatchPage() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player("yt-player", {
        videoId,
        playerVars: { controls: 0 }, // YouTube controls hide
        events: {
          onStateChange: (e) => {
            setIsPlaying(e.data === window.YT.PlayerState.PLAYING);
          },
        },
      });
    };

    return () => {
      delete window.onYouTubeIframeAPIReady;
    };
  }, [videoId]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const skip = (seconds) => {
    if (!playerRef.current) return;
    const current = playerRef.current.getCurrentTime();
    playerRef.current.seekTo(current + seconds, true);
  };

  return (
    <div style={{ padding: "20px", flex: 1 }}>
      <div style={{ maxWidth: "900px", width: "100%" }}>

        {/* Video */}
        <div style={{
          aspectRatio: "16/9",
          width: "100%",
          background: "black",
          borderRadius: "12px 12px 0 0",
          overflow: "hidden",
        }}>
          <div id="yt-player" style={{ width: "100%", height: "100%" }} />
        </div>

        {/* Controls — seedha neeche, no gap */}
        <div style={{
          background: "#000",
          borderRadius: "0 0 12px 12px",
          padding: "10px 16px",
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}>
          <button onClick={() => skip(-10)} style={btnStyle}>◄ 10s</button>

          <button
            onClick={togglePlay}
            style={{
              ...btnStyle,
              background: "#ff0000",
              color: "white",
              fontSize: "18px",
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
          >
            {isPlaying ? "❚❚" : "▶"}
          </button>

          <button onClick={() => skip(10)} style={btnStyle}>10s ►</button>

          <button
            onClick={() => navigate(-1)}
            style={{ ...btnStyle, marginLeft: "auto" }}
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}

const btnStyle = {
  background: "#333",
  border: "none",
  padding: "8px 16px",
  borderRadius: "16px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "600",
  color: "white",
};

export default YouTubeWatchPage;