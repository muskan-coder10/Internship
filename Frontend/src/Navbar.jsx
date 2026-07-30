import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaBars, FaSearch, FaUserCircle, FaYoutube } from "react-icons/fa";
import { MdAddCircle } from "react-icons/md";
import { IoNotificationsOutline, IoClose } from "react-icons/io5";
import { MdLightMode, MdDarkMode } from "react-icons/md";
import { IoLogOutOutline } from "react-icons/io5";
import { useAuth } from "./AuthContext.js";
import { useTheme } from "./context/ThemeContext.js";
import { useSidebar } from "./context/SidebarContext.js";
import { useNotifications } from "./context/NotificationContext.js";

function Navbar() {
  const [query, setQuery] = useState("");
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toggleSidebar } = useSidebar();
  const { notifications, unreadCount, markAllRead } = useNotifications();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setMobileSearchOpen(false);
    }
  };

  const handleClearSearch = () => {
    setQuery("");
  };

  const handleBellClick = () => {
    setShowNotifs((prev) => !prev);
    if (!showNotifs) markAllRead();
  };

  
  if (mobileSearchOpen) {
    return (
      <nav className="navbar navbar-mobile-search">
        <form className="navbar-center navbar-center-mobile" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search"
              className="search-input"
              autoFocus
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
        <button
          type="button"
          className="icon-btn mobile-search-close"
          onClick={() => setMobileSearchOpen(false)}
        >
          <IoClose className="icon" />
        </button>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="icon-btn" onClick={toggleSidebar}>
          <FaBars className="icon" />
        </button>
        <Link to="/" className="navbar-brand">
          <FaYoutube className="youtube-icon" />
          <h2 className="youtube-logo">YouTube</h2>
        </Link>
      </div>

      {/* Desktop/tablet: full inline search bar, unchanged */}
      <form className="navbar-center navbar-center-desktop" onSubmit={handleSearch}>
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

      {/* Mobile: just a search icon that opens the full-width search row above */}
      <button
        type="button"
        className="icon-wrapper mobile-search-trigger"
        onClick={() => setMobileSearchOpen(true)}
      >
        <FaSearch />
      </button>

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
            {/* Username text hides on mobile via CSS; logout becomes icon-only on mobile */}
            <span className="navbar-username">{user.username}</span>
            <button className="logout-btn" onClick={logout}>
              <span className="logout-text">Logout</span>
              <IoLogOutOutline className="logout-icon" />
            </button>
          </>
        ) : (
          <Link to="/login" className="icon-wrapper profile-icon-wrapper">
            <FaUserCircle />
          </Link>
        )}

        {user && (
          <Link to="/pricing" className="pricing-link">
            <span className="pricing-text">⭐ Upgrade</span>
            <span className="pricing-icon-only">⭐</span>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;