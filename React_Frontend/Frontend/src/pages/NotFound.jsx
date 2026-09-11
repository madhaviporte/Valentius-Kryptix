import { Link } from "react-router-dom";

// Rendered for any unknown URL
export default function NotFound() {
  return (
    <section className="notfound-page">
      <p className="notfound-code">404</p>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist or has been moved.</p>
      <Link to="/" className="btn btn-primary">
        Back to my tasks
      </Link>
    </section>
  );
}
