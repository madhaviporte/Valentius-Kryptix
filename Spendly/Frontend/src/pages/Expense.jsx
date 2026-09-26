import { useEffect, useRef, useState } from "react";
import {
  getExpenses,
  getCategories,
  deleteExpense,
} from "../services/api";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import DeleteConfirmation from "../components/DeleteConfirmation";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

export default function Expense() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Bumping this number re-runs the expenses fetch below (after save/delete/retry)
  const [reloadToken, setReloadToken] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("date-desc");

  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const formRef = useRef(null);

  useEffect(() => {
    let active = true;

    // Server-side search / filter / sort via query params
    const [sortField, order] = sortOrder.split("-");
    getExpenses({ search, category: categoryFilter, sort: sortField, order })
      .then((res) => {
        if (!active) return;
        setExpenses(res.data);
        setError(""); // a successful fetch clears any previous error
      })
      .catch(
        (err) => active && setError(err.message || "Unable to load expenses. Please try again.")
      )
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [reloadToken, search, categoryFilter, sortOrder]);

  // Category filter options come from the database
  useEffect(() => {
    let active = true;
    getCategories()
      .then((res) => active && setCategories(res.data))
      .catch(() => {}); // dropdown stays empty; the list shows its own error
    return () => {
      active = false;
    };
  }, []);

  // Debounce search so we don't hit the API on every keystroke
  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput), 400);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  // Show a brief success message after save/delete
  const flashMessage = (message) => {
    setActionMessage(message);
    window.setTimeout(() => setActionMessage(""), 3000);
  };

  const refreshExpenses = () => {
    setError("");
    setLoading(true);
    setReloadToken((token) => token + 1);
  };

  // Retry after an error is a user event, so state can be reset here
  const handleRetry = refreshExpenses;

  const handleSaved = (_savedExpense, wasEditing) => {
    setShowForm(false);
    setEditingExpense(null);
    flashMessage(wasEditing ? "Expense updated" : "Expense added");
    refreshExpenses(); // refresh so totals and filters stay accurate
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
    // Scroll the form into view on smaller screens
    window.setTimeout(
      () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      50
    );
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingExpense) return;
    setDeleteBusy(true);
    try {
      await deleteExpense(deletingExpense._id);
      setDeletingExpense(null);
      flashMessage("Expense deleted");
      refreshExpenses();
    } catch (err) {
      setDeletingExpense(null);
      setError(err.message || "Could not delete the expense. Please try again.");
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>Expenses</h1>
          <p className="page-subtitle">Track, edit and organize your spending</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingExpense(null);
            setShowForm((prev) => !prev);
          }}
        >
          {showForm && !editingExpense ? "Close Form" : "Add Expense"}
        </button>
      </div>

      {/* Add / Edit form - same component for both, remounted fresh per edit */}
      {showForm && (
        <div ref={formRef}>
          <ExpenseForm
            key={editingExpense ? `edit-${editingExpense._id}` : "add"}
            editingExpense={editingExpense}
            onSaved={handleSaved}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      {/* Toolbar: search, category filter, sort */}
      <div className="toolbar card">
        <input
          className="toolbar-search"
          type="search"
          placeholder="Search by title or notes..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Search expenses"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          aria-label="Sort expenses"
        >
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="amount-desc">Amount: high to low</option>
          <option value="amount-asc">Amount: low to high</option>
        </select>
      </div>

      {actionMessage && (
        <p className="success-toast" role="status">
          {actionMessage}
        </p>
      )}

      {loading ? (
        <Loading label="Loading expenses..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={handleRetry} />
      ) : (
        <ExpenseList
          expenses={expenses}
          onEdit={handleEdit}
          onDelete={setDeletingExpense}
          onAddExpense={() => setShowForm(true)}
        />
      )}

      {/* Delete confirmation modal */}
      {deletingExpense && (
        <DeleteConfirmation
          expense={deletingExpense}
          busy={deleteBusy}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingExpense(null)}
        />
      )}
    </section>
  );
}
