// Visible loading UI so the screen is never blank while fetching.
export default function Loading({ label = "Loading..." }) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}
