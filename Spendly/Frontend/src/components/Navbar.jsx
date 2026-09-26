import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar({ page, onNavigate, theme, onToggleTheme }) {
  // Mobile drawer state; every navigation also closes it (see `go`)
  const [menuOpen, setMenuOpen] = useState(false);

  // Navigate and close the drawer in the same user event
  const go = (target) => {
    setMenuOpen(false);
    onNavigate(target);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <button className="brand" onClick={() => go("dashboard")}>
          <span className="brand-mark">₹</span>
          <span className="brand-name">Spendly</span>
        </button>

        {/* Desktop links */}
        <nav className="nav-links" aria-label="Main navigation">
          <button
            className={`nav-link ${page === "dashboard" ? "active" : ""}`}
            onClick={() => go("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`nav-link ${page === "expenses" ? "active" : ""}`}
            onClick={() => go("expenses")}
          >
            Expenses
          </button>
        </nav>

        <div className="navbar-actions">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />

          {/* Hamburger - only visible on small screens */}
          <button
            type="button"
            className={`hamburger ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <nav
        id="mobile-menu"
        className={`mobile-menu ${menuOpen ? "open" : ""}`}
        aria-label="Mobile navigation"
      >
        <button
          className={`mobile-link ${page === "dashboard" ? "active" : ""}`}
          onClick={() => go("dashboard")}
        >
          Dashboard
        </button>
        <button
          className={`mobile-link ${page === "expenses" ? "active" : ""}`}
          onClick={() => go("expenses")}
        >
          Expenses
        </button>
      </nav>
    </header>
  );
}
