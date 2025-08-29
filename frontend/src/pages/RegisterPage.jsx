import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../hooks/useAuth";
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

    const result = await authRegister(
      data.name,
      data.email,
      data.password,
      "customer" // Always set to customer, no selection needed
    );
    if (result.success) {
      setMessage("Registration successful!");
      setTimeout(() => navigate("/"), 1000);
    } else {
      // Set local error if registration fails
      setLocalError(
        result.message || error || "Registration failed. Please try again."
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
                {...register("name", {
                  required: "Name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                  maxLength: {
                    value: 50,
                    message: "Name cannot exceed 50 characters",
                  },
                  pattern: {
                    value: /^[a-zA-Z\s'-]{2,50}$/,
                    message:
                      "Name can only contain letters, spaces, hyphens, and apostrophes",
                  },
                  validate: {
                    noExtraSpaces: (value) =>
                      (value.trim() === value && !value.includes("  ")) ||
                      "Name cannot have leading/trailing spaces or multiple consecutive spaces",
                    notOnlySpaces: (value) =>
                      value.trim().length > 0 || "Name cannot be only spaces",
                  },
                })}
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
                {...register("email", {
                  required: "Email is required",
                  minLength: {
                    value: 5,
                    message: "Email must be at least 5 characters",
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message:
                      "Enter a valid email address (e.g., user@domain.com)",
                  },
                  validate: {
                    noConsecutiveDots: (value) =>
                      !value.includes("..") ||
                      "Email cannot contain consecutive dots",
                    validDomain: (value) => {
                      const domain = value.split("@")[1];
                      return (
                        !domain ||
                        (!domain.startsWith(".") && !domain.endsWith(".")) ||
                        "Invalid domain format"
                      );
                    },
                    noSpaces: (value) =>
                      !/\s/.test(value) || "Email cannot contain spaces",
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
                  pattern: {
                    value:
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
                    message:
                      "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 special character",
                  },
                })}
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
                  required: "Please confirm your password",
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
