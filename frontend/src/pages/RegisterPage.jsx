// User registration page with form validation and account creation
// Handles new user signup with name, email, password and role selection
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../hooks/useAuth";
import { ValidationUtils } from "../utils/validation";
import { ErrorUtils } from "../utils/helpers";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../utils/constants";
import "./AuthPages.css";

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  const {
    register: authRegister,
    loading,
    error,
    isAuthenticated,
    clearError,
  } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [localError, setLocalError] = useState("");

  const password = watch("password");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

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
      const result = await authRegister(
        data.name,
        data.email,
        data.password,
        "customer" // Always set to customer, no selection needed
      );
      if (result.success) {
        setMessage(SUCCESS_MESSAGES.REGISTRATION_SUCCESS);
        setTimeout(() => navigate("/"), 1000);
      } else {
        // Set local error if registration fails
        setLocalError(
          result.message || error || ERROR_MESSAGES.REGISTRATION_FAILED
        );
      }
    } catch (err) {
      setLocalError(
        ErrorUtils.getErrorMessage(err, ERROR_MESSAGES.GENERIC_ERROR)
      );
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-card-header">
          <h2>Create Your Account</h2>
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

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            <div className="auth-form-group">
              <label className="auth-form-label">Full Name</label>
              <input
                type="text"
                className="auth-form-input"
                {...register("name", ValidationUtils.formValidationRules.name)}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <div className="auth-form-error">{errors.name.message}</div>
              )}
            </div>

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

            <div className="auth-form-group">
              <label className="auth-form-label">Confirm Password</label>
              <input
                type="password"
                className="auth-form-input"
                {...register("confirmPassword", {
                  ...ValidationUtils.formValidationRules.confirmPassword,
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <div className="auth-form-error">
                  {errors.confirmPassword.message}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        </div>

        <div className="auth-card-footer">
          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
