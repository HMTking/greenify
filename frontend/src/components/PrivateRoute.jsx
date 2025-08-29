import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login with current path as redirect parameter
  if (!isAuthenticated) {
    const redirectPath = `/login?redirect=${encodeURIComponent(
      location.pathname
    )}`;
    return <Navigate to={redirectPath} />;
  }

  return children;
};

export default PrivateRoute;
