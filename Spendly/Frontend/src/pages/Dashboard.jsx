import { useEffect, useState } from "react";
import { getExpenses } from "../services/api";
import { formatCurrency, relativeDay } from "../utils/format";
import SummaryCard from "../components/SummaryCard";
import CategoryBadge from "../components/CategoryBadge";
import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";

export default function Dashboard({ onNavigate }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Bumping this number re-runs the fetch below (used by Retry)
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;

    // Real data only - all stats below are computed from this API result
    getExpenses()
      .then((res) => {
        if (!active) return;
        setExpenses(res.data);
        setError(""); // a successful fetch clears any previous error
      })
      .catch(
        (err) => active && setError(err.message || "Unable to load dashboard. Please try again.")
      )
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [reloadToken]);

  // Retry is a user event, so we can reset state here directly
  const handleRetry = () => {
    setError("");
    setLoading(true);
    setReloadToken((token) => token + 1);
  };

  // ---- Stats computed from real API data (never hardcoded) ----
  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const recentExpenses = expenses.slice(0, 5);

  const categoryTotals = expenses.reduce((acc, expense) => {
    const name = expense.category?.name || "Uncategorized";
    acc[name] = (acc[name] || 0) + Number(expense.amount || 0);
    return acc;
  }, {});
  const categoryRows = Object.entries(categoryTotals)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);
  const maxCategoryTotal = categoryRows[0]?.total || 0;

  if (loading) return <Loading label="Loading dashboard..." />;

  if (error) {
    return <ErrorMessage message={error} onRetry={handleRetry} />;
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Your spending at a glance</p>
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate("expenses")}>
          Add Expense
        </button>
      </div>

      <div className="summary-grid">
        <SummaryCard label="Total Spent" value={formatCurrency(totalSpent)} />
        <SummaryCard label="Expenses" value={String(expenses.length)} />
        <SummaryCard
          label="Top Category"
          value={categoryRows[0]?.name || "—"}
          hint={categoryRows[0] ? formatCurrency(categoryRows[0].total) : undefined}
        />
      </div>

      <div className="dashboard-grid">
        <div className="card panel">
          <h2 className="panel-title">Recent Expenses</h2>
          {recentExpenses.length === 0 ? (
            <EmptyState
              title="No expenses yet"
              description="Start tracking your spending by adding your first expense."
              actionLabel="Add Expense"
              onAction={() => onNavigate("expenses")}
            />
          ) : (
            <ul className="recent-list">
              {recentExpenses.map((expense) => (
                <li key={expense._id} className="recent-item">
                  <div className="recent-info">
                    <span className="recent-title">{expense.title}</span>
                    <span className="recent-meta">
                      <CategoryBadge name={expense.category?.name} /> ·{" "}
                      <span>{relativeDay(expense.date)}</span>
                    </span>
                  </div>
                  <span className="recent-amount">{formatCurrency(expense.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card panel">
          <h2 className="panel-title">Spending by Category</h2>
          {categoryRows.length === 0 ? (
            <p className="panel-empty">No category data yet.</p>
          ) : (
            <ul className="category-summary">
              {categoryRows.map((row) => (
                <li key={row.name} className="category-summary-row">
                  <div className="category-summary-top">
                    <CategoryBadge name={row.name} />
                    <span className="category-amount">{formatCurrency(row.total)}</span>
                  </div>
                  <div className="category-bar">
                    <div
                      className="category-bar-fill"
                      style={{ width: `${maxCategoryTotal ? (row.total / maxCategoryTotal) * 100 : 0}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
