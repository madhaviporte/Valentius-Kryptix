import { useEffect, useState } from "react";
import { createExpense, updateExpense, getCategories } from "../services/api";

const EMPTY_FORM = { title: "", amount: "", category: "", date: "", notes: "" };

// Shared by Add and Edit. The parent gives this component a `key` based on the
// expense being edited, so it remounts fresh (and pre-filled) for each edit.
export default function ExpenseForm({ editingExpense, onSaved, onCancel }) {
  const isEditing = Boolean(editingExpense);

  const [form, setForm] = useState(() =>
    editingExpense
      ? {
          title: editingExpense.title,
          amount: String(editingExpense.amount),
          category: editingExpense.category?._id || editingExpense.category || "",
          date: editingExpense.date ? editingExpense.date.slice(0, 10) : "",
          notes: editingExpense.notes || "",
        }
      : EMPTY_FORM
  );
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [categoriesError, setCategoriesError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  // Category dropdown is populated from the database, never hardcoded
  useEffect(() => {
    let active = true;
    getCategories()
      .then((res) => active && setCategories(res.data))
      .catch(() => active && setCategoriesError("Could not load categories. Please retry."));
    return () => {
      active = false;
    };
  }, []);

  const loadCategories = () => {
    setCategoriesError("");
    getCategories()
      .then((res) => setCategories(res.data))
      .catch(() => setCategoriesError("Could not load categories. Please retry."));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear the field's error as soon as the user fixes it
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Client-side validation with friendly messages (not relying on browser validation)
  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = "Title cannot be empty";
    if (form.amount === "") next.amount = "Amount cannot be empty";
    else if (isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      next.amount = "Amount must be greater than 0";
    if (!form.category) next.category = "Please choose a category";
    if (!form.date) next.date = "Date is required";
    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setSaving(true);
    setSubmitError("");
    try {
      const payload = {
        title: form.title.trim(),
        amount: Number(form.amount),
        category: form.category,
        date: form.date,
        notes: form.notes.trim(),
      };

      const result = isEditing
        ? await updateExpense(editingExpense._id, payload)
        : await createExpense(payload);

      onSaved(result.data, isEditing);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="expense-form card" onSubmit={handleSubmit} noValidate>
      <h2 className="form-title">{isEditing ? "Edit Expense" : "Add Expense"}</h2>

      {categoriesError && (
        <p className="inline-error" role="alert">
          {categoriesError}{" "}
          <button type="button" className="link-button" onClick={loadCategories}>
            Retry
          </button>
        </p>
      )}

      {submitError && (
        <p className="inline-error" role="alert">
          {submitError}
        </p>
      )}

      <div className="form-row">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="e.g. Lunch with team"
          value={form.title}
          onChange={handleChange}
        />
        {errors.title && <p className="field-error">{errors.title}</p>}
      </div>

      <div className="form-grid">
        <div className="form-row">
          <label htmlFor="amount">Amount (₹)</label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 350"
            value={form.amount}
            onChange={handleChange}
          />
          {errors.amount && <p className="field-error">{errors.amount}</p>}
        </div>

        <div className="form-row">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" value={form.category} onChange={handleChange}>
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category && <p className="field-error">{errors.category}</p>}
        </div>
      </div>

      <div className="form-row">
        <label htmlFor="date">Date</label>
        <input id="date" name="date" type="date" value={form.date} onChange={handleChange} />
        {errors.date && <p className="field-error">{errors.date}</p>}
      </div>

      <div className="form-row">
        <label htmlFor="notes">Notes (optional)</label>
        <textarea
          id="notes"
          name="notes"
          rows="2"
          placeholder="Any details worth remembering"
          value={form.notes}
          onChange={handleChange}
        />
      </div>

      <div className="form-actions">
        {isEditing && (
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? (isEditing ? "Saving..." : "Adding...") : isEditing ? "Save Changes" : "Add Expense"}
        </button>
      </div>
    </form>
  );
}
