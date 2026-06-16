import { NavLink } from "react-router-dom";
import logoImg from "../../assets/images/logo.png";
import logoIcon from "../../assets/images/logo-icon.png";
import { useSidebarContext } from "../../hooks/useSidebar";
import { currentUser } from "../../mocks/userMock";

const mainItems = [
  {
    slug: "home",
    label: "Home",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    slug: "library",
    label: "Library",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
];

function StudentSidebar({ history = [], onHistoryClick, onClearHistory }) {
  const { collapsed, toggle } = useSidebarContext();

  return (
    <aside
      style={{
        width: "100%",
        height: "100%",
        background: "#ffffff",
        borderRight: "1px solid #f1eff5",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 16px 12px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {collapsed ? (
          <img
            src={logoIcon}
            alt="F"
            style={{
              height: "44px",
              width: "44px",
              objectFit: "contain",
              mixBlendMode: "multiply",
              transition: "transform 0.2s ease",
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
          />
        ) : (
          <img
            src={logoImg}
            alt="StudyHub"
            style={{
              height: "42px",
              objectFit: "contain",
              mixBlendMode: "multiply",
              transition: "transform 0.2s ease",
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
          />
        )}
      </div>

      {/* Main label + toggle */}
      <div
        style={{
          padding: "0 16px 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {!collapsed && (
          <span
            style={{
              fontSize: "12px",
              fontWeight: "800",
              color: "#6366f1",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
            }}
          >
            Main
          </span>
        )}
        <button
          onClick={toggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            borderRadius: "6px",
            color: "#4f46e5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: collapsed ? "auto" : "0",
            marginRight: collapsed ? "auto" : "0",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#ede9fe")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        </button>
      </div>

      {/* Nav items */}
      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          padding: "0 8px",
        }}
      >
        {mainItems.map((item) => (
          <NavLink
            key={item.slug}
            to={"/student/" + item.slug}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              ["sidebar-link", "admin-sidebar-link", isActive ? "active" : ""]
                .join(" ")
                .trim()
            }
            style={{
              justifyContent: collapsed ? "center" : "flex-start",
              padding: collapsed ? "10px" : undefined,
            }}
          >
            <span className="sidebar-icon admin-sidebar-icon">{item.icon}</span>
            {!collapsed && (
              <span className="admin-sidebar-label">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* History */}
      {!collapsed && (
        <div
          style={{
            marginTop: "24px",
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "0 16px 8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: "800",
                color: "#6366f1",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
              }}
            >
              History
            </span>
            {history?.length > 0 && (
              <button
                onClick={onClearHistory}
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#fff",
                  background: "#ef4444",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  padding: "2px 8px",
                }}
              >
                Clear
              </button>
            )}
          </div>
          <div style={{ padding: "0 8px", flex: 1, overflowY: "auto" }}>
            {!history?.length ? (
              <span
                style={{
                  fontSize: "12px",
                  color: "#c4c2ce",
                  paddingLeft: "12px",
                }}
              >
                No recent activity
              </span>
            ) : (
              history.map((item, i) => (
                <button
                  key={i}
                  onClick={() => onHistoryClick?.(item)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    width: "100%",
                    minWidth: 0,
                    textAlign: "left",
                    color: "#474554",
                    fontSize: "13px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f4f0ff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "none")
                  }
                >
                  <span style={{ color: "#8c8a9e", flexShrink: 0 }}>
                    {item.type === "course" ? (
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                    ) : (
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    )}
                  </span>
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          padding: "12px 8px",
          borderTop: "1px solid #efedf4",
          marginTop: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            gap: "8px",
          }}
        >
          <NavLink
            to="/student/profile"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              color: "#1a1926",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                border: "1px solid #efedf4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <img
                src={logoImg}
                alt="Profile"
                style={{ width: "80%", height: "80%", objectFit: "contain" }}
              />
            </div>
            {!collapsed && (
              <span style={{ fontSize: "12px", fontWeight: "600" }}>
                Profile
              </span>
            )}
          </NavLink>
          {!collapsed && (
            <button
              style={{
                background: "#eef1f8",
                color: "#5046e5",
                border: "none",
                borderRadius: "12px",
                padding: "6px 10px",
                fontSize: "11px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Upgrade
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

export default StudentSidebar;
