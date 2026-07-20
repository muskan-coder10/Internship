import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRoom, joinRoom } from "./api.js";
import { useAuth } from "./AuthContext.js";
import socket from "./socket";
import useWebRTC from "./hooks/useWebRTC";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaDesktop, FaPhoneSlash, FaCircle } from "react-icons/fa";
import "./WatchPartyPage.css";

function WatchPartyPage() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [participants, setParticipants] = useState([]);
  const [isRecording, setIsRecording] = useState(false);

  const chatEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const localVideoRef = useRef(null);

  const username = user?.username || "Guest";

  const {
    localStream,
    remoteStreams,
    isMuted,
    isCameraOff,
    isScreenSharing,
    toggleMute,
    toggleCamera,
    startScreenShare,
    stopScreenShare,
  } = useWebRTC(roomId);

  // Local video attach
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    const loadRoom = async () => {
      try {
        await joinRoom(roomId);
        const res = await getRoom(roomId);
        setRoom(res.data);
        socket.emit("join-room", { roomId, username });
      } catch (err) {
        setError(err.response?.data?.message || "Could not load room");
      }
    };

    loadRoom();

    socket.on("chat-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("participants-updated", (data) => {
      setParticipants(data);
    });

    return () => {
      socket.emit("leave-room", { roomId, username });
      socket.off("chat-message");
      socket.off("participants-updated");
    };
  }, [roomId, username]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    socket.emit("chat-message", { roomId, username, message: newMessage });
    setNewMessage("");
  };

  const handleLeave = () => {
    socket.emit("leave-room", { roomId, username });
    navigate("/");
  };

  const toggleScreenShare = () => {
    if (isScreenSharing) stopScreenShare();
    else startScreenShare();
  };

  const toggleRecording = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      if (!localStream) return;
      recordedChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(localStream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `watch-party-${roomId}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  if (error) return <p className="watch-party-error">{error}</p>;
  if (!room) return <p className="watch-party-loading">Loading room...</p>;

  return (
    <div className="watch-party-page">
      <div className="watch-party-main">
        <div className="watch-party-header">
          <h2>🎉 Watch Party — {room.videoTitle}</h2>
          <p className="room-code">
            Room Code: <strong>{room.roomId}</strong>
          </p>
        </div>

        {/* YouTube Video */}
        <div className="watch-party-player">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${room.youtubeId}?enablejsapi=1`}
            title={room.videoTitle}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        {/* Video Call Grid */}
        <div className="video-call-grid">
          {localStream && (
            <div className="video-tile">
              <video ref={localVideoRef} autoPlay playsInline muted />
              <span className="video-tile-label">{username} (You)</span>
            </div>
          )}
          {Object.entries(remoteStreams).map(([socketId, stream]) => {
            const participant = participants.find((p) => p.socketId === socketId);
            return (
              <RemoteVideo
                key={socketId}
                stream={stream}
                label={participant?.username || "Guest"}
              />
            );
          })}
        </div>

        {/* Call Controls */}
        <div className="call-controls">
          <button
            className={`control-btn ${isMuted ? "active" : ""}`}
            onClick={toggleMute}
          >
            {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
            <span>{isMuted ? "Unmute" : "Mute"}</span>
          </button>

          <button
            className={`control-btn ${isCameraOff ? "active" : ""}`}
            onClick={toggleCamera}
          >
            {isCameraOff ? <FaVideoSlash /> : <FaVideo />}
            <span>{isCameraOff ? "Cam On" : "Cam Off"}</span>
          </button>

          <button
            className={`control-btn ${isScreenSharing ? "active" : ""}`}
            onClick={toggleScreenShare}
          >
            <FaDesktop />
            <span>{isScreenSharing ? "Stop Share" : "Share"}</span>
          </button>

          <button
            className={`control-btn ${isRecording ? "recording" : ""}`}
            onClick={toggleRecording}
          >
            <FaCircle />
            <span>{isRecording ? "Stop Rec" : "Record"}</span>
          </button>

          <button className="control-btn leave-control-btn" onClick={handleLeave}>
            <FaPhoneSlash />
            <span>Leave</span>
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="watch-party-sidebar">
        <div className="participants-section">
          <h3>👥 Participants ({participants.length})</h3>
          <ul className="participants-list">
            {participants.map((p, index) => (
              <li key={index} className="participant-item">
                <div className="participant-avatar">
                  {p.username.charAt(0).toUpperCase()}
                </div>
                <span>{p.username}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="chat-section">
          <h3>💬 Live Chat</h3>
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-message ${msg.username === username ? "own-message" : ""}`}
              >
                <span className="chat-username">{msg.username}</span>
                <span className="chat-text">{msg.message}</span>
                <span className="chat-time">{msg.time}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form className="chat-input-form" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder="Send a message..."
              className="chat-input"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button type="submit" className="chat-send-btn">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Remote video helper (small inline component — no separate file needed)
function RemoteVideo({ stream, label }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="video-tile">
      <video ref={videoRef} autoPlay playsInline />
      <span className="video-tile-label">{label}</span>
    </div>
  );
}

export default WatchPartyPage;