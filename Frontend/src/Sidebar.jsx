import { Link } from "react-router-dom";
import { FaHome, FaHistory } from "react-icons/fa";
import { IoMdPerson } from "react-icons/io";
import { MdSubscriptions } from "react-icons/md";
import { SiYoutubeshorts } from "react-icons/si";
import { MdOutlinePlaylistPlay } from "react-icons/md";
import { GrLike } from "react-icons/gr";
import { IoMdDownload } from "react-icons/io";
import "./Sidebar.css";
import { useAuth } from "./AuthContext.js";
import { useSidebar } from "./context/SidebarContext.js";
import { FiShoppingBag } from "react-icons/fi";
import { IoMusicalNoteOutline } from "react-icons/io5";
import { PiFilmStrip } from "react-icons/pi";
import { MdLiveTv } from "react-icons/md";
import { SiYoutubegaming } from "react-icons/si";
import { FaRegNewspaper } from "react-icons/fa";
import { GrTrophy } from "react-icons/gr";
import { FaGraduationCap } from "react-icons/fa6";
import { PiCoatHangerBold } from "react-icons/pi";
import { MdOutlinePodcasts } from "react-icons/md";
import { FaYoutube } from "react-icons/fa";
import { SiYoutubemusic } from "react-icons/si";
import { TbBrandYoutubeKids } from "react-icons/tb";
import { BiLogoYoutube } from "react-icons/bi";
import { SiYoutubestudio } from "react-icons/si";

function Sidebar() {
  const { user } = useAuth();
  const { collapsed, toggleSidebar } = useSidebar();

  return (
    <>
      {/* Backdrop only shows on mobile while the drawer is open — tapping
          it closes the sidebar, matching how the real YouTube app and
          most mobile nav drawers behave. */}
      <div
        className={`sidebar-backdrop ${!collapsed ? "visible" : ""}`}
        onClick={toggleSidebar}
      />

      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <Link to="/" className="sidebar-item">
          <FaHome />
          <span>Home</span>
        </Link>

        <Link to="/shorts" className="sidebar-item">
          <SiYoutubeshorts />
          <span>Shorts</span>
        </Link>

        <hr className="sidebar-divider" />

        <Link to="/subscriptions" className="sidebar-item">
          <MdSubscriptions />
          <span>Subscriptions</span>
        </Link>

        <Link to="/history" className="sidebar-item">
          <FaHistory />
          <span>History</span>
        </Link>

        <Link to={user ? `/channel/${user.username}` : "/login"} className="sidebar-item">
          <IoMdPerson />
          <span>Your Channel</span>
        </Link>

        <Link to="/playlist" className="sidebar-item">
          <MdOutlinePlaylistPlay />
          <span>Watch Later</span>
        </Link>

        <Link to="/liked" className="sidebar-item">
          <GrLike />
          <span>Liked Videos</span>
        </Link>

        <Link to="/downloads" className="sidebar-item">
          <IoMdDownload />
          <span>Download</span>
        </Link>

        <hr className="sidebar-divider" />

        <Link to="/shopping" className="sidebar-item">
          <FiShoppingBag />
          <span>Shopping</span>
        </Link>

        <Link to="/Music" className="sidebar-item">
          <IoMusicalNoteOutline />
          <span>Music</span>
        </Link>

        <Link to="/Films" className="sidebar-item">
          <PiFilmStrip />
          <span>Films</span>
        </Link>

        <Link to="/Live" className="sidebar-item">
          <MdLiveTv />
          <span>Live</span>
        </Link>

        <Link to="/Gaming" className="sidebar-item">
          <SiYoutubegaming />
          <span>Gaming</span>
        </Link>

        <Link to="/News" className="sidebar-item">
          <FaRegNewspaper />
          <span>News</span>
        </Link>

        <Link to="/Sports" className="sidebar-item">
          <GrTrophy />
          <span>Sports</span>
        </Link>

        <Link to="/Courses" className="sidebar-item">
          <FaGraduationCap />
          <span>Courses</span>
        </Link>

        <Link to="/Fashion & Beauty" className="sidebar-item">
          <PiCoatHangerBold />
          <span>Fashion & Beauty</span>
        </Link>

        <Link to="/Podcast" className="sidebar-item">
          <MdOutlinePodcasts />
          <span>Podcast</span>
        </Link>

        <Link to="/Memberships" className="sidebar-item">
          <FaYoutube />
          <span>Memberships</span>
        </Link>

        <Link to="/Youtube premium" className="sidebar-item">
          <BiLogoYoutube />
          <span>Youtube premium</span>
        </Link>

        <Link to="/Youtube Studio" className="sidebar-item">
          <SiYoutubestudio />
          <span>Youtube Studio</span>
        </Link>

        <Link to="/Youtube Music" className="sidebar-item">
          <SiYoutubemusic />
          <span>Youtube Music</span>
        </Link>

        <Link to="/Youtube Kids" className="sidebar-item">
          <TbBrandYoutubeKids />
          <span>Youtube Music</span>
        </Link>
      </div>
    </>
  );
}

export default Sidebar;