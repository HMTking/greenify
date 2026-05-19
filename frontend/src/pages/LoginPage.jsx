import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../hooks/useAuth";
import { ValidationUtils } from "../utils/validation";
import { ErrorUtils } from "../utils/helpers";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../utils/constants";
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
    setMessage("");
    setLocalError("");

    try {
      const result = await login(data.email, data.password);
      if (result.success) {
        setMessage(SUCCESS_MESSAGES.LOGIN_SUCCESS);
      } else {
        setLocalError(result.message || error || ERROR_MESSAGES.LOGIN_FAILED);
      }
    } catch (err) {
      setLocalError(
        ErrorUtils.getErrorMessage(err, ERROR_MESSAGES.GENERIC_ERROR)
      );
    }
  };

  const handleDemoLogin = async (email, password) => {
    setMessage("");
    setLocalError("");
    setValue("email", email);
    setValue("password", password);

    try {
      const result = await login(email, password);
      if (!result.success) {
        setLocalError(result.message || ERROR_MESSAGES.LOGIN_FAILED);
      }
    } catch (err) {
      setLocalError(ErrorUtils.getErrorMessage(err, ERROR_MESSAGES.GENERIC_ERROR));
    }
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

          <div className="demo-credentials">
            <button
              type="button"
              className="demo-btn demo-btn-user"
              disabled={loading}
              onClick={() => handleDemoLogin("customer@gmail.com", "PlantLover@456")}
            >
              Demo User
            </button>
            <button
              type="button"
              className="demo-btn demo-btn-admin"
              disabled={loading}
              onClick={() => handleDemoLogin("admin@gmail.com", "AdminPlant@123")}
            >
              Demo Admin
            </button>
          </div>

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
