import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRedirect = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is authenticated and is an admin, redirect to admin dashboard
    if (isAuthenticated && user?.role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // If user is admin, don't render the children (they'll be redirected)
  if (isAuthenticated && user?.role === "admin") {
    return null;
  }

  // Render children for non-admin users
  return children;
};

export default AdminRedirect;
