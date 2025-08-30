// Protected route component that restricts access to admin users only
// Redirects non-admin users to home page or login if not authenticated
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // If not authenticated, redirect to login with current path as redirect parameter
    const redirectPath = `/login?redirect=${encodeURIComponent(
      location.pathname
    )}`;
    return <Navigate to={redirectPath} />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute;
