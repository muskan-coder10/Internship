

import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

//  token is attached automatically when logged in
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------- Authentication ----------
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const getProfile = () => API.get("/auth/profile");
export const getUserByUsername = (username) => API.get(`/auth/user/${username}`);

// ---------- Videos ----------
export const getVideos = (params) => API.get("/videos", { params });
export const getVideoById = (id) => API.get(`/videos/${id}`);
export const createVideo = (data) => API.post("/videos", data);
export const updateVideo = (id, data) => API.put(`/videos/${id}`, data);
export const getVideosByChannel = (userId) =>
  API.get(`/videos/channel/${userId}`);
export const likeVideo = (id) => API.put(`/videos/${id}/like`);
export const toggleSubscribe = (channelId) => API.put(`/auth/subscribe/${channelId}`);

// ---------- Watch Party Rooms ----------
export const createRoom = (data) => API.post("/rooms", data);
export const getRoom = (roomId) => API.get(`/rooms/${roomId}`);
export const joinRoom = (roomId) => API.post(`/rooms/${roomId}/join`);

// ---------- Downloads ----------
export const requestDownload = (data) => API.post("/downloads", data);
export const getMyDownloads = () => API.get("/downloads/my");
export const getRemainingDownloads = () => API.get("/downloads/remaining");

// ---------- Payments ----------
export const createOrder = (data) => API.post("/payments/create-order", data);
export const verifyPayment = (data) => API.post("/payments/verify", data);
export const getPaymentHistory = () => API.get("/payments/history");

// ---------- File Upload ----------
export const uploadVideoFile = (formData) =>
  API.post("/videos/upload-video", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const uploadThumbnailFile = (formData) =>
  API.post("/videos/upload-thumbnail", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const verifyOTP = (data) => API.post("/auth/verify-otp", data);
export const updateTheme = (data) => API.put("/auth/theme", data);

// ---------- Comments ----------
export const getComments = (videoId) => API.get(`/comments/${videoId}`);
export const postComment = (data) => API.post("/comments", data);
export const likeComment = (id) => API.put(`/comments/${id}/like`);
export const dislikeComment = (id) => API.put(`/comments/${id}/dislike`);
export const reportComment = (id) => API.post(`/comments/${id}/report`);
export const deleteComment = (id) => API.delete(`/comments/${id}`);

//----------- Avatar -------------

export const updateAvatar = (formData) =>
  API.put("/auth/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// -------Signup ---------------

export const googleAuth = (data) => API.post("/auth/google", data);

export default API;