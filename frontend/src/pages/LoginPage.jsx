// User login page with form validation and test credentials
// Handles user authentication and redirects based on user role
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../hooks/useAuth";
import { ValidationUtils } from "../utils/validation";
import { UIUtils, ErrorUtils } from "../utils/helpers";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../utils/constants";
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

    try {
      const result = await login(data.email, data.password);
      if (result.success) {
        setMessage(SUCCESS_MESSAGES.LOGIN_SUCCESS);
        // Remove manual navigation - let useEffect handle it when isAuthenticated changes
      } else {
        // Set local error if login fails
        setLocalError(result.message || error || ERROR_MESSAGES.LOGIN_FAILED);
      }
    } catch (err) {
      setLocalError(
        ErrorUtils.getErrorMessage(err, ERROR_MESSAGES.GENERIC_ERROR)
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
              style={UIUtils.getToggleButtonStyles(showTestCredentials)}
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
                {...register(
                  "email",
                  ValidationUtils.formValidationRules.email
                )}
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
                {...register(
                  "password",
                  ValidationUtils.formValidationRules.password
                )}
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
