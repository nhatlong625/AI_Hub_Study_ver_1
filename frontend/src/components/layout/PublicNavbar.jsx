import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home' },
  { to: '/guide', label: 'Guide' },
  { to: '/pricing', label: 'Pricing' },
];

function PublicNavbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink className="brand" to="/">
          <span className="brand-mark">AS</span>
          <span>AI StudyHub</span>
        </NavLink>
        <nav className="nav-links">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => ['nav-link', isActive ? 'active' : ''].join(' ').trim()}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="inline-actions">
          <NavLink to="/login" className="btn btn-ghost">
            Log in
          </NavLink>
          <NavLink to="/register" className="btn btn-primary">
            Get started
          </NavLink>
        </div>
      </div>
    </header>
  );
}

export default PublicNavbar;
