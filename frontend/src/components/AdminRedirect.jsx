// Component that redirects admin users to admin dashboard
// Prevents admin users from accessing regular user pages

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
// useAuth is custom Hook
import { useAuth } from "../hooks/useAuth";

const AdminRedirect = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is authenticated and is an admin, redirect to admin dashboard
    if (isAuthenticated && user?.role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  if (isAuthenticated && user?.role === "admin") {
    return null;
  }

  // replace: true → Redirect doesn’t leave the restricted page in browser history.

  // [isAuthenticated, user, navigate] → Effect re-runs whenever login state or user info changes.

  // if (isAuthenticated && user?.role === "admin") → Blocks rendering restricted content for admins (page stays blank until redirect completes).

  // Render children for non-admin users
  return children;
};

export default AdminRedirect;
