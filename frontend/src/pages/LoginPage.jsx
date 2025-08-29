import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../hooks/useAuth";
import TestCredentials from "../components/TestCredentials";
import "./AuthPages.css";

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const { login, loading, error, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("");
  const [localError, setLocalError] = useState("");
  const [showTestCredentials, setShowTestCredentials] = useState(false);

  // Get redirect parameter from URL
  const redirectTo = searchParams.get("redirect") || "/";

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect to the original page or home page
      navigate(redirectTo);
    }
  }, [isAuthenticated, navigate, redirectTo]);

  // Clear any previous error only when component unmounts or route changes
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const onSubmit = async (data) => {
    // Clear previous messages
    setMessage("");
    setLocalError("");

    const result = await login(data.email, data.password);
    if (result.success) {
      setMessage("Login successful!");
      // Remove manual navigation - let useEffect handle it when isAuthenticated changes
    } else {
      // Set local error if login fails
      setLocalError(
        result.message ||
          error ||
          "Login failed. Please check your credentials."
      );
    }
  };

  const onFillCredentials = (email, password) => {
    setValue("email", email);
    setValue("password", password);
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-card-header">
          <h2>Login to Your Account</h2>
        </div>

        <div className="auth-card-body">
          {(error || localError) && (
            <div className="auth-alert auth-alert-error">
              {localError || error}
            </div>
          )}
          {message && (
            <div className="auth-alert auth-alert-success">{message}</div>
          )}

          {/* Toggle button for test credentials */}
          <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
            <button
              type="button"
              onClick={() => setShowTestCredentials(!showTestCredentials)}
              className="btn btn-secondary"
              style={{
                backgroundColor: showTestCredentials ? "#4f46e5" : "#6b7280",
                color: "white",
                padding: "0.5rem 1rem",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.875rem",
                transition: "all 0.2s ease",
              }}
            >
              {showTestCredentials ? "Hide" : "Show"} Test Credentials
            </button>
          </div>

          {/* Conditional Test Credentials */}
          {showTestCredentials && (
            <TestCredentials onFillCredentials={onFillCredentials} />
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            <div className="auth-form-group">
              <label className="auth-form-label">Email</label>
              <input
                type="email"
                className="auth-form-input"
                {...register("email", {
                  required: "Email is required",
                  minLength: {
                    value: 5,
                    message: "Email must be at least 5 characters",
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Enter a valid email address",
                  },
                })}
                placeholder="Enter your email"
              />
              {errors.email && (
                <div className="auth-form-error">{errors.email.message}</div>
              )}
            </div>

            <div className="auth-form-group">
              <label className="auth-form-label">Password</label>
              <input
                type="password"
                className="auth-form-input"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
                placeholder="Enter your password"
              />
              {errors.password && (
                <div className="auth-form-error">{errors.password.message}</div>
              )}
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>

        <div className="auth-card-footer">
          <p>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
