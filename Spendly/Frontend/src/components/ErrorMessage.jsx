export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-state" role="alert">
      <div className="error-icon">!</div>
      <div className="error-body">
        <p className="error-title">Something went wrong</p>
        <p className="error-message">{message}</p>
      </div>
      {onRetry && (
        <button className="btn btn-secondary" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
