import { LoaderCircle } from "lucide-react";

// Visible loading UI so the screen is never blank while fetching.
export default function Loading({ label = "Loading..." }) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <LoaderCircle size={30} className="spinner-icon spin" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}
