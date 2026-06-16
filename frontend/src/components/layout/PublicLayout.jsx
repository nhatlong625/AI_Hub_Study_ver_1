import { Outlet } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';

function PublicLayout() {
  return (
    <div className="public-layout">
      <PublicNavbar />
      <main className="public-main">
        <div className="container">
          <Outlet />
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

export default PublicLayout;
