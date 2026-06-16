import { Outlet, useNavigate } from "react-router-dom";
import { useSidebar, SidebarContext } from "../../hooks/useSidebar";
import StudentSidebar from "./StudentSidebar";
import Topbar from "./Topbar";
import { useHistory, HistoryContext } from "../../hooks/useHistory";

function StudentLayout() {
  const navigate = useNavigate();
  const { history, addToHistory, clearHistory } = useHistory();
  const sidebar = useSidebar();

  const handleCourseClick = (courseId, semester) => {
    addToHistory({ type: "course", label: courseId, courseId, semester });
    navigate("/student/courses");
  };

  const handleFileClick = (file) => {
    addToHistory({ type: "file", label: file.name, file });
    navigate(`/student/documents/${file.id}`);
  };

  const handleHistoryClick = (item) => {
    if (item.type === "course") navigate("/student/courses");
    else navigate(`/student/documents/${item.file?.id}`);
  };

  return (
    <SidebarContext.Provider value={sidebar}>
      <HistoryContext.Provider value={{ addToHistory }}>
        <div
          className="dashboard-layout"
          style={{
            gridTemplateColumns: sidebar.collapsed ? "60px 1fr" : "220px 1fr",
          }}
        >
          <div
            className="dashboard-sidebar"
            style={{ padding: 0, background: "transparent", border: "none" }}
          >
            <StudentSidebar
              history={history}
              onHistoryClick={handleHistoryClick}
              onClearHistory={clearHistory}
            />
          </div>
          <div className="dashboard-content">
            <Topbar
              onCourseClick={handleCourseClick}
              onFileClick={handleFileClick}
            />
            <main className="dashboard-main">
              <Outlet />
            </main>
          </div>
        </div>
      </HistoryContext.Provider>
    </SidebarContext.Provider>
  );
}

export default StudentLayout;
