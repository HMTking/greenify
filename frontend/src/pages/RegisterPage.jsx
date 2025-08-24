import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";

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
    <div
      className="container"
      style={{ maxWidth: "400px", margin: "4rem auto" }}
    >
      <div className="card">
        <div className="card-header text-center">
          <h2>Create Your Account</h2>
        </div>

        <div className="card-body">
          {(error || localError) && (
            <div className="alert alert-error">{localError || error}</div>
          )}
          {message && <div className="alert alert-success">{message}</div>}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
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
                <div className="form-error">{errors.name.message}</div>
              )}
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#666",
                  marginTop: "0.25rem",
                }}
              >
                2-50 characters, letters and spaces only
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
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
                placeholder="Enter your email (e.g., user@example.com)"
              />
              {errors.email && (
                <div className="form-error">{errors.email.message}</div>
              )}
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#666",
                  marginTop: "0.25rem",
                }}
              >
                Must be a valid email format with proper domain (e.g.,
                user@domain.com)
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
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
                <div className="form-error">{errors.password.message}</div>
              )}
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#666",
                  marginTop: "0.25rem",
                }}
              >
                Password must be at least 8 characters with 1 uppercase letter
                and 1 special character
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-input"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <div className="form-error">
                  {errors.confirmPassword.message}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        </div>

        <div className="card-footer text-center">
          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
