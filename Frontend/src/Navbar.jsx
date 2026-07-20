import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaBars, FaSearch, FaUserCircle, FaYoutube } from "react-icons/fa";
import { MdAddCircle } from "react-icons/md";
import { IoNotificationsOutline, IoClose } from "react-icons/io5"; // CHANGED: added IoClose
import { MdLightMode, MdDarkMode } from "react-icons/md";
import { useAuth } from "./AuthContext.js";
import { useTheme } from "./context/ThemeContext.js";
import { useSidebar } from "./context/SidebarContext.js";
import { useNotifications } from "./context/NotificationContext.js";

function Navbar() {
  const [query, setQuery] = useState("");
  const [showNotifs, setShowNotifs] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toggleSidebar } = useSidebar();
  const { notifications, unreadCount, markAllRead } = useNotifications();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleClearSearch = () => {
    setQuery(""); // NEW
  };

  const handleBellClick = () => {
    setShowNotifs((prev) => !prev);
    if (!showNotifs) markAllRead();
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="icon-btn" onClick={toggleSidebar}>
          <FaBars className="icon" />
        </button>
        <Link to="/" className="navbar-brand" onClick={toggleSidebar}>
          <FaYoutube className="youtube-icon" />
          <h2 className="youtube-logo">YouTube</h2>
        </Link>
      </div>

      {/* CHANGED: search input wrapped with a clear (X) button */}
      <form className="navbar-center" onSubmit={handleSearch}>
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search"
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={handleClearSearch}
            >
              <IoClose />
            </button>
          )}
        </div>
        <button type="submit" className="search-btn">
          <FaSearch />
        </button>
      </form>

      <div className="navbar-right">
        <button className="create-btn" onClick={() => navigate("/upload")}>
          <MdAddCircle className="create-icon" />
          <span className="create-text">Create</span>
        </button>

        <div className="notification-wrapper">
          <div className="icon-wrapper" onClick={handleBellClick}>
            <IoNotificationsOutline />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </div>

          {showNotifs && (
            <div className="notification-dropdown">
              {notifications.length === 0 ? (
                <p className="notification-empty">No notifications yet.</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="notification-item">
                    {n.message}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title="Toggle theme"
        >
          {theme === "dark" ? (
            <MdLightMode className="theme-icon" />
          ) : (
            <MdDarkMode className="theme-icon" />
          )}
        </button>

        {user ? (
          <>
            <span className="navbar-username">{user.username}</span>
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="icon-wrapper profile-icon-wrapper">
            <FaUserCircle />
          </Link>
        )}

        {user && (
          <Link to="/pricing" className="pricing-link">
            ⭐ Upgrade
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;