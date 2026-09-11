// User-friendly error panel with an optional retry button.
export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null;

  return (
    <div className="error-box" role="alert">
      <p className="error-title">Something went wrong</p>
      <p className="error-message">{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-primary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
