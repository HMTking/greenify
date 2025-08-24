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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    // Close mobile menu on route change
    const handleRouteChange = () => {
      setIsMobileMenuOpen(false);
      setShowProfileDropdown(false);
    };

    // Close mobile menu on scroll
    const handleScroll = () => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    // Close mobile menu on escape key
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setShowProfileDropdown(false);
    setIsMobileMenuOpen(false);
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
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
            onClick={closeMobileMenu}
          >
            🌱 Mini Plant Store
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${isMobileMenuOpen ? "open" : ""}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

          {/* Mobile Overlay */}
          {isMobileMenuOpen && (
            <div className="mobile-overlay" onClick={closeMobileMenu} />
          )}

          <div className={`nav-links ${isMobileMenuOpen ? "mobile-open" : ""}`}>
            {/* Show Home and Catalog only for non-admin users */}
            {(!isAuthenticated || user?.role !== "admin") && (
              <>
                <Link
                  to="/"
                  className={`nav-link ${isActive("/") ? "active" : ""}`}
                  onClick={closeMobileMenu}
                >
                  Home
                </Link>
                <Link
                  to="/catalog"
                  className={`nav-link ${isActive("/catalog") ? "active" : ""}`}
                  onClick={closeMobileMenu}
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
                    onClick={closeMobileMenu}
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
                    onClick={closeMobileMenu}
                  >
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/orders"
                    className={`nav-link ${
                      isActive("/orders") ? "active" : ""
                    }`}
                    onClick={closeMobileMenu}
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
                        onClick={() => {
                          closeProfileDropdown();
                          closeMobileMenu();
                        }}
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
                  onClick={closeMobileMenu}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="auth-register-btn"
                  onClick={closeMobileMenu}
                >
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
