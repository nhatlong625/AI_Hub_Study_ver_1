import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import Topbar from './Topbar';

function AdminLayout() {
  return (
    <div className="dashboard-layout admin-dashboard-layout">
      <AdminSidebar />
      <div className="dashboard-content">
        <Topbar isAdmin={true} />
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
