import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "./Navbar.css";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
    setShowProfileDropdown(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const closeProfileDropdown = () => {
    setShowProfileDropdown(false);
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-content">
          <Link
            to={
              isAuthenticated && user?.role === "admin"
                ? "/admin/dashboard"
                : "/"
            }
            className="nav-logo"
          >
            🌱 Mini Plant Store
          </Link>

          <div className="nav-links">
            {/* Show Home and Catalog only for non-admin users */}
            {(!isAuthenticated || user?.role !== "admin") && (
              <>
                <Link
                  to="/"
                  className={`nav-link ${isActive("/") ? "active" : ""}`}
                >
                  Home
                </Link>
                <Link
                  to="/catalog"
                  className={`nav-link ${isActive("/catalog") ? "active" : ""}`}
                >
                  Catalog
                </Link>
              </>
            )}

            {isAuthenticated ? (
              <>
                {/* Show Cart only for non-admin users */}
                {user?.role !== "admin" && (
                  <Link
                    to="/cart"
                    className={`nav-link cart-link ${
                      isActive("/cart") ? "active" : ""
                    }`}
                  >
                    Cart ({getCartItemsCount()})
                  </Link>
                )}

                {user?.role === "admin" ? (
                  <Link
                    to="/admin/dashboard"
                    className={`nav-link ${
                      isActive("/admin/dashboard") ||
                      location.pathname.startsWith("/admin")
                        ? "active"
                        : ""
                    }`}
                  >
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/orders"
                    className={`nav-link ${
                      isActive("/orders") ? "active" : ""
                    }`}
                  >
                    Orders
                  </Link>
                )}

                <div className="profile-dropdown" ref={dropdownRef}>
                  <button
                    className="profile-button"
                    onClick={toggleProfileDropdown}
                  >
                    <div className="profile-avatar">
                      {user?.name ? user.name.charAt(0).toUpperCase() : "👤"}
                    </div>
                  </button>

                  {showProfileDropdown && (
                    <div className="dropdown-menu">
                      <Link
                        to="/profile"
                        className="dropdown-item"
                        onClick={closeProfileDropdown}
                      >
                        Edit Profile
                      </Link>
                      <button
                        className="dropdown-item logout-item"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="auth-buttons">
                <Link
                  to="/login"
                  className={`auth-login-btn ${
                    isActive("/login") ? "active" : ""
                  }`}
                >
                  Login
                </Link>
                <Link to="/register" className="auth-register-btn">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
