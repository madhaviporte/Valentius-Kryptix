import { NavLink, Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// App shell: sticky navbar, routed page content, footer.
export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }) =>
    isActive ? "nav-link nav-link-active" : "nav-link";

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <header className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="brand">
            <span className="brand-mark" aria-hidden="true">✓</span>
            TaskFlow
          </Link>

          <nav className="nav-links" aria-label="Main navigation">
            <NavLink to="/" end className={navLinkClass}>
              My Tasks
            </NavLink>
            <NavLink to="/tasks/new" className={navLinkClass}>
              New Task
            </NavLink>
          </nav>

          <div className="nav-auth">
            {user ? (
              <>
                <span className="nav-user" title={user.email || ""}>
                  {user.name || "User"}
                </span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>
            )}
          </div>
        </div>
      </header>

      <main className="page">
        <Outlet />
      </main>

      <footer className="footer">
        TaskFlow — React frontend for the WA-2 Task REST API (Madhavi Porte)
      </footer>
    </div>
  );
}
