import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { ListTodo, Plus, LogOut, Menu, X, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Brand from "./Brand";

// App shell: sticky navbar (brand left, nav + user right), routed page
// content, footer. Mobile: nav collapses behind a hamburger — routing and
// auth logic unchanged.
export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    isActive ? "nav-link nav-link-active" : "nav-link";

  function handleLogout() {
    setMenuOpen(false);
    logout();
    navigate("/login");
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  const initial = (user?.name || "U").trim().charAt(0).toUpperCase();

  return (
    <div className="app-shell">
      <header className="navbar">
        <div className="navbar-inner">
          <Brand />

          <div className="nav-right">
            <nav className="nav-links" aria-label="Main navigation">
              <NavLink to="/" end className={navLinkClass}>
                <ListTodo size={16} aria-hidden="true" />
                My Tasks
              </NavLink>
              <NavLink to="/tasks/new" className="nav-cta">
                <Plus size={16} aria-hidden="true" />
                New Task
              </NavLink>
            </nav>

            {user ? (
              <>
                <span className="nav-divider" aria-hidden="true" />
                <span className="nav-user" title={user.email || ""}>
                  <span className="avatar" aria-hidden="true">{initial}</span>
                  <span className="nav-user-name">{user.name || "User"}</span>
                  <ChevronDown size={14} color="var(--muted)" aria-hidden="true" />
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost nav-logout"
                  onClick={handleLogout}
                >
                  <LogOut size={15} aria-hidden="true" />
                  Logout
                </button>
              </>
            ) : (
              <NavLink to="/login" className="nav-link">
                Login
              </NavLink>
            )}
          </div>

          <button
            type="button"
            className="nav-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <nav className="mobile-menu" aria-label="Mobile navigation">
            <NavLink to="/" end className={navLinkClass} onClick={closeMenu}>
              <ListTodo size={16} aria-hidden="true" />
              My Tasks
            </NavLink>
            <NavLink to="/tasks/new" className="nav-cta" onClick={closeMenu}>
              <Plus size={16} aria-hidden="true" />
              New Task
            </NavLink>
            {user && (
              <>
                <span className="mobile-user">
                  <span className="avatar" aria-hidden="true">{initial}</span>
                  {user.name || "User"}
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-danger-soft"
                  onClick={handleLogout}
                >
                  <LogOut size={15} aria-hidden="true" />
                  Logout
                </button>
              </>
            )}
          </nav>
        )}
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
