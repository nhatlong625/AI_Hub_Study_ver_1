import { useState } from "react";
import TopbarSearchDropdown from "../common/TopbarSearchDropdown";
import NotificationPanel from "../common/NotificationPanel";
import logoImg from "../../assets/logos/logo.png";

// TODO: thay bằng user thật từ auth context khi có JWT
const currentUser = { fullName: "Student", email: "" };


const SearchWrapper = ({ children }) => (
  <div
    style={{
      position: "relative",
      display: "flex",
      alignItems: "center",
      width: "480px",
    }}
  >
    <svg
      style={{
        position: "absolute",
        left: "20px",
        color: "#8c8a9e",
        pointerEvents: "none",
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
    {children}
  </div>
);

function StudentTopbar({ isAdmin = false, onCourseClick, onFileClick }) {
  const topbarClass =
    "sticky top-0 z-10 flex items-center justify-between gap-5 px-7 py-4 bg-white border-b border-[#f1eff5]";

  const [query, setQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  if (isAdmin) {
    return (
      <header className={topbarClass}>
        <SearchWrapper>
          <input
            type="text"
            placeholder="Search users, documents, or settings..."
            style={{
              width: "100%",
              padding: "12px 20px 12px 48px",
              border: "none",
              borderRadius: "9999px",
              backgroundColor: "#f1f3f9",
              color: "#1a1926",
              fontSize: "13px",
              outline: "none",
              transition: "all 0.2s ease",
            }}
          />
        </SearchWrapper>

        <div className="flex items-center gap-6">
          <NotificationButton />
          <ProfileSection name="Admin" role="Super Admin" />
        </div>
      </header>
    );
  }

  return (
    <header className={topbarClass}>
      <SearchWrapper>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search courses, documents..."
          style={{
            width: "100%",
            padding: "12px 20px 12px 48px",
            border: "none",
            borderRadius: "9999px",
            backgroundColor: "#f1f3f9",
            color: "#1a1926",
            fontSize: "13px",
            outline: "none",
            transition: "all 0.2s ease",
          }}
        />
        {query.trim().length > 0 && (
          <TopbarSearchDropdown
            query={query}
            onCourseClick={onCourseClick}
            onFileClick={onFileClick}
            onClose={() => setQuery("")}
          />
        )}
      </SearchWrapper>

      <div className="flex items-center gap-5" style={{ gap: "20px" }}>
        {/* Streak Badge */}
        <div
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
            animation: "fire-glow 2s infinite ease-in-out",
            transition:
              "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          }}
        >
          <svg
            style={{
              animation: "fire-flicker 1.2s infinite alternate ease-in-out",
              transformOrigin: "bottom center",
              color: "#ea580c",
              filter: "drop-shadow(0 0 3px rgba(234,88,12,0.6))",
            }}
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
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
          </svg>
          {currentUser.streakDays} Days
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications((v) => !v)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "6px",
              borderRadius: "50%",
            }}
            type="button"
            aria-label="Notifications"
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
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
          </button>
          {hasUnread && (
            <span
              style={{
                position: "absolute",
                top: "6px",
                right: "6px",
                width: "8px",
                height: "8px",
                backgroundColor: "#e1261c",
                borderRadius: "50%",
                border: "1.5px solid #ffffff",
                pointerEvents: "none",
              }}
            />
          )}
          {showNotifications && (
            <NotificationPanel
              onClose={() => setShowNotifications(false)}
              onAllRead={() => setHasUnread(false)}
            />
          )}
        </div>

        {/* Profile */}
        <ProfileSection name={currentUser.name} role={currentUser.role} />
      </div>
    </header>
  );
}

function NotificationButton() {
  return (
    <button
      className="relative p-1.5 flex items-center justify-center rounded-full text-[#4a4857] bg-transparent border-none cursor-pointer hover:bg-[#f5f4f8] transition-colors"
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
      >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full border-[1.5px] border-white" />
    </button>
  );
}

function ProfileSection({ name, role }) {
  return (
    <div className="flex items-center gap-3 cursor-pointer">
      <div className="w-9 h-9 rounded-full bg-[#f0edff] border border-[#ece7f5] flex items-center justify-center overflow-hidden">
        <img
          src={logoImg}
          alt="Avatar"
          className="w-4/5 h-4/5 object-contain"
        />
      </div>
      <div className="flex flex-col leading-snug">
        <span className="text-[13px] font-bold text-[#1a1926]">{name}</span>
        <span className="text-[11px] font-medium text-[#8c8a9e]">{role}</span>
      </div>
    </div>
  );
}

export default StudentTopbar;
