import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "./Loading";

// Blocks protected pages until the user is logged in.
// While the stored token is being verified, show a loading screen.
export default function ProtectedRoute({ children }) {
  const { token, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <Loading label="Checking your session..." />;
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
