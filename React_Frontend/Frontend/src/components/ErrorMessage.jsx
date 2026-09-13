import { TriangleAlert, RotateCcw } from "lucide-react";

// User-friendly error panel with an optional retry button.
export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null;

  return (
    <div className="error-box" role="alert">
      <span className="error-icon" aria-hidden="true">
        <TriangleAlert size={17} />
      </span>
      <div className="error-body">
        <p className="error-title">Something went wrong</p>
        <p className="error-message">{message}</p>
        {onRetry && (
          <button type="button" className="btn btn-sm btn-danger" onClick={onRetry}>
            <RotateCcw size={14} aria-hidden="true" />
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
