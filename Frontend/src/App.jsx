import { BrowserRouter, Routes, Route, NavLink, useNavigate } from "react-router-dom";
import { FaHome, FaUserCircle } from "react-icons/fa";
import { SiYoutubeshorts } from "react-icons/si";
import { MdAddCircle, MdSubscriptions } from "react-icons/md";
import Navbar from "./Navbar";
import "./Navbar.css";
import "./App.css"; 
import Sidebar from "./Sidebar";
import HomePage from "./HomePage";
import VideoPage from "./VideoPage";
import HistoryPage from "./HistoryPage";
import LikedVideosPage from "./LikedVideosPage";
import WatchLaterPage from "./WatchLaterPage";
import ChannelPage from "./ChannelPage";
import SearchPage from "./SearchPage";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import WatchPartyPage from "./WatchPartyPage";
import UploadVideoPage from "./UploadVideoPage";
import DownloadsPage from "./DownloadsPage";
import PricingPage from "./PricingPage";
import PaymentSuccess from "./PaymentSuccess";
import YouTubeWatchPage from "./YouTubeWatchPage";
import OTPPage from "./OTPPage";
import ComingSoon from "./ComingSoon";
import { SidebarProvider } from "./context/SidebarProvider.jsx";
import { NotificationProvider } from "./context/NotificationProvider.jsx";
import { useAuth } from "./AuthContext.js";

// NEW: mobile bottom tab bar, defined right here instead of a separate
// file — only visible on mobile via CSS (see .bottom-nav in App.css).
function BottomNav() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <nav className="bottom-nav">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}
      >
        <FaHome />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/shorts"
        className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}
      >
        <SiYoutubeshorts />
        <span>Shorts</span>
      </NavLink>

      <button
        className="bottom-nav-item bottom-nav-create"
        onClick={() => navigate("/upload")}
      >
        <MdAddCircle />
      </button>

      <NavLink
        to="/subscriptions"
        className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}
      >
        <MdSubscriptions />
        <span>Subscriptions</span>
      </NavLink>

      <NavLink
        to={user ? `/channel/${user.username}` : "/login"}
        className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}
      >
        <FaUserCircle />
        <span>{user ? "You" : "Login"}</span>
      </NavLink>
    </nav>
  );
}

function App() {
  return (
    <NotificationProvider>
      <SidebarProvider>
        <BrowserRouter>
          <Navbar />
          <div className="main-content">
            <Sidebar />
            <div className="content-area">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/video/:id" element={<VideoPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/liked" element={<LikedVideosPage />} />
                <Route path="/playlist" element={<WatchLaterPage />} />
                <Route path="/channel/:username" element={<ChannelPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/watch-party/:roomId" element={<WatchPartyPage />} />
                <Route path="/upload" element={<UploadVideoPage />} />
                <Route path="/downloads" element={<DownloadsPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/subscriptions" element={<PricingPage />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/watch-youtube/:videoId" element={<YouTubeWatchPage />} />
                <Route path="/verify-otp" element={<OTPPage />} />
                <Route path="*" element={<ComingSoon />} />
              </Routes>
            </div>
          </div>
          {/* Bottom tab bar — only visible on mobile via CSS */}
          <BottomNav />
        </BrowserRouter>
      </SidebarProvider>
    </NotificationProvider>
  );
}

export default App;