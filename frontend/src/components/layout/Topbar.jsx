import { useState } from "react";
import TopbarSearchDropdown from "../common/TopbarSearchDropdown";
import NotificationPanel from "../common/NotificationPanel";
import SearchBar from "../common/SearchBar";
import Avatar from "../common/Avatar";
import { currentUser } from "../../mocks/userMock";
import logoImg from "../../assets/images/logo.png";

function Topbar({ isAdmin = false, onCourseClick, onFileClick }) {
  if (isAdmin) {
    return (
      <header className="admin-topbar">
        <div className="admin-search-wrapper">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="admin-search-icon"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search users, documents, or settings..."
            className="admin-search-input"
          />
        </div>

        <div className="admin-topbar-actions">
          <button
            className="admin-notification-btn"
            type="button"
            aria-label="Notifications"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="bell-icon"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <span className="notification-badge-dot"></span>
          </button>

          <div className="admin-profile-section">
            <div className="admin-avatar-wrapper">
              <img
                src={logoImg}
                alt="Admin Avatar"
                className="admin-avatar-img"
              />
            </div>
            <div className="admin-profile-info">
              <span className="admin-profile-name">Admin</span>
              <span className="admin-profile-role">Super Admin</span>
            </div>
          </div>
        </div>
      </header>
    );
  }

  const [query, setQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="admin-topbar" style={{ background: "#ffffff" }}>
      <div className="admin-search-wrapper" style={{ position: "relative" }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="admin-search-icon"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search courses, documents..."
          className="admin-search-input"
        />
        {query.trim().length > 0 && (
          <TopbarSearchDropdown
            query={query}
            onCourseClick={onCourseClick}
            onFileClick={onFileClick}
            onClose={() => setQuery("")}
          />
        )}
      </div>

      <div
        className="admin-topbar-actions"
        style={{ display: "flex", alignItems: "center", gap: "20px" }}
      >
        {/* Streak Badge */}
        <div
          className="streak-badge"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
            border: "1px solid rgba(251, 140, 0, 0.3)",
            color: "#e65100",
            padding: "6px 14px",
            borderRadius: "24px",
            fontWeight: "800",
            fontSize: "15px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(251, 140, 0, 0.15)",
            whiteSpace: "nowrap",
          }}
        >
          <svg
            className="streak-flame"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
          </svg>
          {currentUser.streakDays} Days
        </div>

        {/* Notification Bell */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowNotifications((v) => !v)}
            className="admin-notification-btn"
            type="button"
            aria-label="Notifications"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#474554"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="bell-icon"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
          </button>
          {showNotifications && (
            <NotificationPanel onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* Profile Section */}
        <div
          className="admin-profile-section"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer",
          }}
        >
          <div
            className="admin-avatar-wrapper"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "#e0e7ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <img
              src={logoImg}
              alt="Avatar"
              style={{ width: "70%", height: "70%", objectFit: "contain" }}
            />
          </div>
          <div
            className="admin-profile-info"
            style={{ display: "flex", flexDirection: "column" }}
          >
            <span
              className="admin-profile-name"
              style={{
                color: "#1a1926",
                fontWeight: "700",
                fontSize: "14px",
                lineHeight: "1.2",
              }}
            >
              Alex Nguyen
            </span>
            <span
              className="admin-profile-role"
              style={{
                color: "#888",
                fontWeight: "500",
                fontSize: "12px",
                lineHeight: "1.2",
              }}
            >
              Premium
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
