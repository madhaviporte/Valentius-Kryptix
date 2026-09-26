import { useState } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Expense from "./pages/Expense";
import useTheme from "./hooks/useTheme";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app">
      <Navbar page={page} onNavigate={setPage} theme={theme} onToggleTheme={toggleTheme} />
      <main className="main">
        {page === "dashboard" ? <Dashboard onNavigate={setPage} /> : <Expense />}
      </main>
      <footer className="footer">
        <p>Spendly — track your daily expenses</p>
      </footer>
    </div>
  );
}
