import { Navigate, useRoutes } from "react-router-dom";
import PublicLayout from "../components/layout/PublicLayout";
import StudentLayout from "../components/layout/StudentLayout";
import AdminLayout from "../components/layout/AdminLayout";
import ScrollToTop from "./ScrollToTop";

// ── Landing ──────────────────────────────────────────────────
import FeaturesPage from "../pages/landing/FeaturesPage";
import GuidePage from "../pages/landing/GuidePage";
import PricingPage from "../pages/landing/PricingPage";

// ── Auth ─────────────────────────────────────────────────────
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import VerifyEmailPage from "../pages/auth/VerifyEmailPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import ResetSuccessPage from "../pages/auth/ResetSuccessPage";

// ── Student ───────────────────────────────────────────────────
import StudentHomePage from "../pages/student/StudentHomePage";
import StudentCoursesPage from "../pages/student/StudentCoursesPage";
import StudentCourseDetailPage from "../pages/student/StudentCourseDetailPage";
import StudentMyCoursesPage from "../pages/student/StudentMyCoursesPage";
import StudentLibraryPage from "../pages/student/StudentLibraryPage";
import StudentLibraryCourseDetailPage from "../pages/student/StudentLibraryCourseDetailPage";
import StudentDocumentViewPage from "../pages/student/StudentDocumentViewPage";
import StudentUploadDocumentPage from "../pages/student/StudentUploadDocumentPage";
import StudentAITutorPage from "../pages/student/StudentAITutorPage";
import StudentAIChatPage from "../pages/student/StudentAIChatPage";
import StudentPracticeTestsPage from "../pages/student/StudentPracticeTestsPage";
import StudentGeneratePracticeTestPage from "../pages/student/StudentGeneratePracticeTestPage";
import StudentQuizTakingPage from "../pages/student/StudentQuizTakingPage";
import StudentQuizResultPage from "../pages/student/StudentQuizResultPage";

// ── Admin ─────────────────────────────────────────────────────
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import ShareLayout from "../components/layout/ShareLayout";
import SharedDocumentViewPage from "../pages/share/SharedDocumentViewPage";
import AdminUserManagementPage from "../pages/admin/AdminUserManagementPage";
import AdminLibraryManagementPage from "../pages/admin/AdminLibraryManagementPage";
import AdminPracticeTestManagementPage from "../pages/admin/AdminPracticeTestManagementPage";
import AdminQuestionReviewQueuePage from "../pages/admin/AdminQuestionReviewQueuePage";
import AdminDocumentManagementPage from "../pages/admin/AdminDocumentManagementPage";
import AdminPaymentManagementPage from "../pages/admin/AdminPaymentManagementPage";
import AdminSettingsPage from "../pages/admin/AdminSettingsPage";

// ── Placeholder cho tính năng chưa làm ───────────────────────
const ComingSoon = () => (
  <div className="flex flex-col items-center justify-center min-h-screen text-gray-400">
    <p className="text-lg font-semibold">Coming Soon</p>
    <p className="text-sm mt-1">This feature is under development.</p>
  </div>
);

function AppRouter() {
  const routes = useRoutes([
    // ── Public / Landing ─────────────────────────────────────
    {
      path: "/",
      element: <PublicLayout />,
      children: [
        { index: true, element: <Navigate to="/features" replace /> },
        { path: "features", element: <FeaturesPage /> },
        { path: "guide", element: <GuidePage /> },
        { path: "pricing", element: <PricingPage /> },
        { path: "login", element: <LoginPage /> },
        { path: "register", element: <RegisterPage /> },
        { path: "forgot-password", element: <ForgotPasswordPage /> },
        { path: "verify-email", element: <VerifyEmailPage /> },
        { path: "reset-password", element: <ResetPasswordPage /> },
        { path: "reset-success", element: <ResetSuccessPage /> },
      ],
    },

    // ── Student ──────────────────────────────────────────────
    {
      path: "/student",
      element: <StudentLayout />,
      children: [
        { index: true, element: <Navigate to="/student/home" replace /> },

        // Home & Courses
        { path: "home", element: <StudentHomePage /> },
        { path: "courses", element: <StudentCoursesPage /> },
        { path: "courses/:courseId", element: <StudentCourseDetailPage /> },
        { path: "my-courses", element: <StudentMyCoursesPage /> },

        // Library
        { path: "library", element: <StudentLibraryPage /> },
        {
          path: "library/:courseId",
          element: <StudentLibraryCourseDetailPage />,
        },

        // Documents
        { path: "documents/:documentId", element: <StudentDocumentViewPage /> },
        { path: "upload-document", element: <StudentUploadDocumentPage /> },

        // AI Tutor & Chat
        { path: "ai-tutor", element: <StudentAITutorPage /> },
        { path: "ai-tutor/chat", element: <StudentAIChatPage /> },
        { path: "ai-tutor/chat/:threadId", element: <StudentAIChatPage /> },
        { path: "ai-tutor/select-context", element: <ComingSoon /> },

        // Practice Tests & Quiz — chưa làm
        { path: "practice-tests", element: <StudentPracticeTestsPage /> },
        { path: "practice-tests/generate", element: <StudentGeneratePracticeTestPage /> },
        { path: "quiz/:quizId", element: <StudentQuizTakingPage /> },
        { path: "quiz/:quizId/result", element: <StudentQuizResultPage /> },

        // Profile & Settings — chưa làm
        { path: "profile", element: <ComingSoon /> },
        { path: "settings", element: <ComingSoon /> },
      ],
    },

    // ── Admin ────────────────────────────────────────────────
    {
      path: "/admin",
      element: <AdminLayout />,
      children: [
        { index: true, element: <Navigate to="/admin/dashboard" replace /> },
        { path: "dashboard", element: <AdminDashboardPage /> },
        { path: "users", element: <AdminUserManagementPage /> },
        { path: "library", element: <AdminLibraryManagementPage /> },
        {
          path: "practice-tests",
          element: <AdminPracticeTestManagementPage />,
        },
        { path: "question-review", element: <AdminQuestionReviewQueuePage /> },
        { path: "documents", element: <AdminDocumentManagementPage /> },
        { path: "payments", element: <AdminPaymentManagementPage /> },
        { path: "settings", element: <AdminSettingsPage /> },
      ],
    },

    // ── Share (public — ngoài /student/* để tránh auth guard sau B1) ──
    {
      path: "/share",
      element: <ShareLayout />,
      children: [{ path: ":shareId", element: <SharedDocumentViewPage /> }],
    },

    { path: "*", element: <Navigate to="/" replace /> },
  ]);

  return (
    <>
      <ScrollToTop />
      {routes}
    </>
  );
}

export default AppRouter;
