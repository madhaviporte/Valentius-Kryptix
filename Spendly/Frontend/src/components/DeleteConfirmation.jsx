import { useEffect } from "react";
import { formatCurrency } from "../utils/format";

export default function DeleteConfirmation({ expense, busy, onConfirm, onCancel }) {
  // Let the Escape key cancel, like a normal dialog
  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h3>Delete expense?</h3>
        <p>
          Are you sure you want to delete <strong>{expense.title}</strong> (
          {formatCurrency(expense.amount)})? This cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
