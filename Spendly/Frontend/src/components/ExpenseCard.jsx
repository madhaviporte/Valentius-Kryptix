import CategoryBadge from "./CategoryBadge";
import { formatCurrency, formatDate } from "../utils/format";

export default function ExpenseCard({ expense, onEdit, onDelete }) {
  return (
    <div className="expense-card card">
      <div className="expense-main">
        <div className="expense-info">
          <h3 className="expense-title">{expense.title}</h3>
          <div className="expense-meta">
            <CategoryBadge name={expense.category?.name} />
            <span className="expense-date">{formatDate(expense.date)}</span>
          </div>
          {expense.notes && <p className="expense-notes">{expense.notes}</p>}
        </div>

        <div className="expense-side">
          <span className="expense-amount">{formatCurrency(expense.amount)}</span>
          <div className="expense-actions">
            <button
              className="btn-icon"
              onClick={() => onEdit(expense)}
              aria-label={`Edit ${expense.title}`}
              title="Edit"
            >
              ✏️
            </button>
            <button
              className="btn-icon btn-icon-danger"
              onClick={() => onDelete(expense)}
              aria-label={`Delete ${expense.title}`}
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
