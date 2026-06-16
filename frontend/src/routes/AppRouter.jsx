import { Navigate, useRoutes } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import StudentLayout from '../components/layout/StudentLayout';
import AdminLayout from '../components/layout/AdminLayout';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import UserManagementPage from '../pages/admin/UserManagementPage';
import LibraryManagementPage from '../pages/admin/LibraryManagementPage';
import PracticeTestManagementPage from '../pages/admin/PracticeTestManagementPage';
import QuestionReviewQueuePage from '../pages/admin/QuestionReviewQueuePage';
import DocumentManagementPage from '../pages/admin/DocumentManagementPage';
import PaymentManagementPage from '../pages/admin/PaymentManagementPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';

function ModulePlaceholder({ title }) {
  return (
    <section className="page-shell">
      <div className="card">
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">
          This route is preserved, but its module is not included in the current AI_Hub_Study_ver_1 source checkout.
        </p>
      </div>
    </section>
  );
}

function AppRouter() {
  return useRoutes([
    {
      path: '/',
      element: <PublicLayout />,
      children: [
        { index: true, element: <ModulePlaceholder title="Landing" /> },
        { path: 'guide', element: <ModulePlaceholder title="Guide" /> },
        { path: 'pricing', element: <ModulePlaceholder title="Pricing" /> },
        { path: 'login', element: <ModulePlaceholder title="Login" /> },
        { path: 'register', element: <ModulePlaceholder title="Register" /> },
        { path: 'forgot-password', element: <ModulePlaceholder title="Forgot Password" /> },
        { path: 'verify-email', element: <ModulePlaceholder title="Verify Email" /> },
      ],
    },
    {
      path: '/student',
      element: <StudentLayout />,
      children: [
        { index: true, element: <Navigate to="/student/home" replace /> },
        { path: 'home', element: <ModulePlaceholder title="Student Home" /> },
        { path: 'courses', element: <ModulePlaceholder title="Courses" /> },
        { path: 'my-courses', element: <ModulePlaceholder title="My Courses" /> },
        { path: 'library', element: <ModulePlaceholder title="Library" /> },
        { path: 'documents', element: <ModulePlaceholder title="Document Viewer" /> },
        { path: 'documents/:documentId', element: <ModulePlaceholder title="Document Viewer" /> },
        { path: 'upload-document', element: <ModulePlaceholder title="Upload Document" /> },
        { path: 'profile', element: <ModulePlaceholder title="Profile" /> },
        { path: 'settings', element: <ModulePlaceholder title="Student Settings" /> },
      ],
    },
    {
      path: '/admin',
      element: <AdminLayout />,
      children: [
        { index: true, element: <Navigate to="/admin/dashboard" replace /> },
        { path: 'dashboard', element: <AdminDashboardPage /> },
        { path: 'users', element: <UserManagementPage /> },
        { path: 'library', element: <LibraryManagementPage /> },
        { path: 'practice-tests', element: <PracticeTestManagementPage /> },
        { path: 'question-review', element: <QuestionReviewQueuePage /> },
        { path: 'documents', element: <DocumentManagementPage /> },
        { path: 'payments', element: <PaymentManagementPage /> },
        { path: 'settings', element: <AdminSettingsPage /> },
      ],
    },
    { path: '*', element: <Navigate to="/" replace /> },
  ]);
}

export default AppRouter;
