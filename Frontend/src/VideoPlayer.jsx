import { useEffect, useRef, useState } from "react";
import "./VideoPlayer.css";
import CommentSection from "./CommentSection";

function VideoPlayer({ src, onEnded, nextVideo, videoId }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressRef = useRef(null);
  const hideControlsTimer = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showNextVideo, setShowNextVideo] = useState(false);
  const [nextVideoCountdown, setNextVideoCountdown] = useState(5);
  const [showSkipLeft, setShowSkipLeft] = useState(false);
  const [showSkipRight, setShowSkipRight] = useState(false);

  const lastTapRef = useRef({ time: 0, side: "" });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onDurationChange = () => setDuration(video.duration);
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onVideoEnded = () => {
      setIsPlaying(false);
      if (nextVideo) setShowNextVideo(true);
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onVideoEnded);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onVideoEnded);
    };
  }, [nextVideo]);

  // Next video countdown
  useEffect(() => {
    if (!showNextVideo) return;
    if (nextVideoCountdown === 0) {
      onEnded?.();
      return;
    }
    const timer = setTimeout(() => {
      setNextVideoCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [showNextVideo, nextVideoCountdown, onEnded]);

  // Fullscreen change listener
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const resetHideTimer = () => {
    setShowControls(true);
    clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 5000);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleSeek = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * duration;
  };

  const skip = (seconds) => {
    const video = videoRef.current;
    video.currentTime = Math.min(
      Math.max(0, video.currentTime + seconds),
      duration
    );
  };

  const handleVolume = (e) => {
    const val = parseFloat(e.target.value);
    videoRef.current.volume = val;
    setVolume(val);
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // NEW: jumps straight to the next video (used by the Next button),
  // separate from the auto-play-after-ended countdown flow above.
  const handleNextClick = (e) => {
    e.stopPropagation();
    if (!nextVideo) return;
    setShowNextVideo(false);
    setNextVideoCountdown(5);
    onEnded?.();
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleTap = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const tapX = e.touches?.[0]?.clientX || e.clientX;
    const side = tapX - rect.left < rect.width / 2 ? "left" : "right";
    const now = Date.now();

    if (
      now - lastTapRef.current.time < 300 &&
      lastTapRef.current.side === side
    ) {
      if (side === "left") {
        skip(-10);
        setShowSkipLeft(true);
        setTimeout(() => setShowSkipLeft(false), 800);
      } else {
        skip(10);
        setShowSkipRight(true);
        setTimeout(() => setShowSkipRight(false), 800);
      }
    } else {
      resetHideTimer();
    }

    lastTapRef.current = { time: now, side };
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <div
        ref={containerRef}
        className={`vp-container ${isFullscreen ? "vp-fullscreen" : ""}`}
        onMouseMove={resetHideTimer}
        onTouchStart={handleTap}
        onClick={handleTap}
      >
        <video
          ref={videoRef}
          src={src}
          className="vp-video"
          onClick={togglePlay}
        />

        {/* Loading spinner */}
        {isLoading && (
          <div className="vp-spinner-wrapper">
            <div className="vp-spinner"></div>
          </div>
        )}

        {/* Skip indicators */}
        {showSkipLeft && (
          <div className="vp-skip-indicator vp-skip-left">◄◄ 10s</div>
        )}
        {showSkipRight && (
          <div className="vp-skip-indicator vp-skip-right">10s ►►</div>
        )}

        {/* Next video overlay */}
        {showNextVideo && nextVideo && (
          <div className="vp-next-overlay">
            <p>Next video in {nextVideoCountdown}s</p>
            <h4>{nextVideo.title}</h4>
            <div className="vp-next-actions">
              <button onClick={() => onEnded?.()}>Play Now</button>
              <button
                onClick={() => {
                  setShowNextVideo(false);
                  setNextVideoCountdown(5);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className={`vp-controls ${showControls ? "vp-visible" : "vp-hidden"}`}>
          {/* Progress bar */}
          <div ref={progressRef} className="vp-progress" onClick={handleSeek}>
            <div className="vp-progress-fill" style={{ width: `${progress}%` }}></div>
            <div className="vp-progress-thumb" style={{ left: `${progress}%` }}></div>
          </div>

          {/* Bottom controls */}
          <div className="vp-controls-bottom">
            <div className="vp-controls-left">
              <button className="vp-btn" onClick={() => skip(-10)}>◄10</button>
              <button className="vp-btn vp-play-btn" onClick={togglePlay}>
                {isPlaying ? "❚❚" : "▶"}
              </button>
              <button className="vp-btn" onClick={() => skip(10)}>10►</button>

              {/* NEW: Next button — only shown when a next video is available */}
              {nextVideo && (
                <button
                  className="vp-btn vp-next-btn"
                  onClick={handleNextClick}
                  aria-label="Next video"
                  title={nextVideo.title}
                >
                  ▶❚
                </button>
              )}

              <span className="vp-time">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="vp-controls-right">
              <button className="vp-btn" onClick={toggleMute}>
                {isMuted || volume === 0 ? "🔇" : "🔊"}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolume}
                className="vp-volume"
              />
              <button className="vp-btn" onClick={toggleFullscreen}>
                {isFullscreen ? "✕" : "⛶"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <CommentSection videoId={videoId} />
    </>
  );
}

export default VideoPlayer;