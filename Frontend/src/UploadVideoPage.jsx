import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createVideo, uploadVideoFile, uploadThumbnailFile } from "./api";
import { useAuth } from "./AuthContext.js";
import "./UploadVideoPage.css";

const categories = [
  "All", "Music", "Gaming", "News", "Live", "React", "JavaScript",
  "Podcasts", "Movies", "Sports", "Cooking", "Technology",
];

function UploadVideoPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("All");
  const [error, setError] = useState("");

  // Mode toggles: "file" or "url"
  const [thumbnailMode, setThumbnailMode] = useState("file");
  const [videoMode, setVideoMode] = useState("file");

  // File states
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  // URL states
  const [thumbnailUrlInput, setThumbnailUrlInput] = useState("");
  const [videoUrlInput, setVideoUrlInput] = useState("");

  // Upload progress states
  const [videoUploading, setVideoUploading] = useState(false);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [videoUploadProgress, setVideoUploadProgress] = useState("");

  if (!user) {
    return (
      <div className="upload-page">
        <p className="upload-error">You must be logged in to upload a video.</p>
      </div>
    );
  }

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnailFile(file);
    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => setThumbnailPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation depends on chosen mode
    if (thumbnailMode === "file" && !thumbnailFile) {
      setError("Please select a thumbnail image");
      return;
    }
    if (thumbnailMode === "url" && !thumbnailUrlInput.trim()) {
      setError("Please paste a thumbnail image URL");
      return;
    }
    if (videoMode === "file" && !videoFile) {
      setError("Please select a video file");
      return;
    }
    if (videoMode === "url" && !videoUrlInput.trim()) {
      setError("Please paste a video URL");
      return;
    }

    try {
      // ---- Step 1 — Get thumbnail URL (upload or use pasted URL) ----
      let thumbnailUrl = "";
      if (thumbnailMode === "file") {
        setThumbnailUploading(true);
        const thumbFormData = new FormData();
        thumbFormData.append("thumbnail", thumbnailFile);
        const thumbRes = await uploadThumbnailFile(thumbFormData);
        thumbnailUrl = thumbRes.data.url;
        setThumbnailUploading(false);
      } else {
        thumbnailUrl = thumbnailUrlInput.trim();
      }

      // ---- Step 2 — Get video URL (upload or use pasted URL) ----
      let videoUrl = "";
      if (videoMode === "file") {
        setVideoUploading(true);
        setVideoUploadProgress("Uploading video... this may take a moment");
        const videoFormData = new FormData();
        videoFormData.append("video", videoFile);
        const videoRes = await uploadVideoFile(videoFormData);
        videoUrl = videoRes.data.url;
        setVideoUploading(false);
        setVideoUploadProgress("");
      } else {
        videoUrl = videoUrlInput.trim();
      }

      // ---- Step 3 — Save to database ----
      setSubmitting(true);
      const res = await createVideo({
        title,
        description,
        thumbnail: thumbnailUrl,
        videoUrl,
        category,
      });

      navigate(`/video/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
      setVideoUploading(false);
      setThumbnailUploading(false);
      setSubmitting(false);
    }
  };

  const isLoading = videoUploading || thumbnailUploading || submitting;

  return (
    <div className="upload-page">
      <form className="upload-card" onSubmit={handleSubmit}>
        <h2 className="upload-title">Upload Video</h2>

        {error && <p className="upload-error">{error}</p>}

        <label className="upload-label">Title</label>
        <input
          type="text"
          placeholder="Video title"
          className="upload-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label className="upload-label">Description</label>
        <textarea
          placeholder="Describe your video"
          className="upload-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />

        {/* ---------- Thumbnail section ---------- */}
        <label className="upload-label">Thumbnail Image</label>
        <div className="upload-mode-toggle">
          <button
            type="button"
            className={thumbnailMode === "file" ? "mode-btn active" : "mode-btn"}
            onClick={() => setThumbnailMode("file")}
          >
            Upload File
          </button>
          <button
            type="button"
            className={thumbnailMode === "url" ? "mode-btn active" : "mode-btn"}
            onClick={() => setThumbnailMode("url")}
          >
            Paste URL
          </button>
        </div>

        {thumbnailMode === "file" ? (
          <>
            <input
              type="file"
              accept="image/*"
              className="upload-file-input"
              onChange={handleThumbnailChange}
            />
            {thumbnailUploading && (
              <p className="upload-progress">Uploading thumbnail...</p>
            )}
            {thumbnailPreview && (
              <div className="upload-preview">
                <p className="upload-preview-label">Thumbnail Preview</p>
                <img src={thumbnailPreview} alt="Thumbnail preview" />
              </div>
            )}
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="https://example.com/thumbnail.jpg"
              className="upload-input"
              value={thumbnailUrlInput}
              onChange={(e) => setThumbnailUrlInput(e.target.value)}
            />
            {thumbnailUrlInput && (
              <div className="upload-preview">
                <p className="upload-preview-label">Thumbnail Preview</p>
                <img src={thumbnailUrlInput} alt="Thumbnail preview" />
              </div>
            )}
          </>
        )}

        {/* ---------- Video section ---------- */}
        <label className="upload-label">Video File</label>
        <div className="upload-mode-toggle">
          <button
            type="button"
            className={videoMode === "file" ? "mode-btn active" : "mode-btn"}
            onClick={() => setVideoMode("file")}
          >
            Upload File
          </button>
          <button
            type="button"
            className={videoMode === "url" ? "mode-btn active" : "mode-btn"}
            onClick={() => setVideoMode("url")}
          >
            Paste URL
          </button>
        </div>

        {videoMode === "file" ? (
          <>
            <input
              type="file"
              accept="video/*"
              className="upload-file-input"
              onChange={(e) => setVideoFile(e.target.files[0])}
            />
            {videoFile && (
              <p className="upload-file-name">
                Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)
              </p>
            )}
            {videoUploadProgress && (
              <p className="upload-progress">{videoUploadProgress}</p>
            )}
          </>
        ) : (
          <input
            type="text"
            placeholder="https://example.com/video.mp4"
            className="upload-input"
            value={videoUrlInput}
            onChange={(e) => setVideoUrlInput(e.target.value)}
          />
        )}

        <label className="upload-label">Category</label>
        <select
          className="upload-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <button type="submit" className="upload-btn" disabled={isLoading}>
          {thumbnailUploading
            ? "Uploading thumbnail..."
            : videoUploading
            ? "Uploading video..."
            : submitting
            ? "Saving..."
            : "Upload"}
        </button>
      </form>
    </div>
  );
}

export default UploadVideoPage;