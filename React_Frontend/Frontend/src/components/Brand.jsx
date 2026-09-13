import { Link } from "react-router-dom";
import { Check } from "lucide-react";

// TaskFlow logo + wordmark, used in the navbar and auth screens.
export default function Brand({ to = "/" }) {
  return (
    <Link to={to} className="brand">
      <span className="brand-mark" aria-hidden="true">
        <Check size={15} strokeWidth={3.2} />
      </span>
      TaskFlow
    </Link>
  );
}
