import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import "./AuthPages.css";

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { login, loading, error, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

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
      setTimeout(() => navigate("/"), 1000);
    } else {
      // Set local error if login fails
      setLocalError(
        result.message ||
          error ||
          "Login failed. Please check your credentials."
      );
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage(`${type} copied to clipboard!`);
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setMessage(`${type} copied to clipboard!`);
      setTimeout(() => setMessage(""), 2000);
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

          <div className="test-credentials">
            <h4>🔧 Test Login Credentials</h4>
            <div className="credentials-section">
              <strong>🔧 Admin Account:</strong>
              <div className="credential-item">Email: admin@gmail.com</div>
              <div className="credential-item">Password: AdminPlant@123</div>
              <button
                type="button"
                className="copy-credential-btn"
                onClick={() =>
                  copyToClipboard("admin@gmail.com", "Admin email")
                }
                title="Copy admin email"
              >
                Copy Email
              </button>
              <button
                type="button"
                className="copy-credential-btn copy-all-btn"
                onClick={() =>
                  copyToClipboard(
                    "Email: admin@gmail.com\nPassword: AdminPlant@123",
                    "Admin credentials"
                  )
                }
                title="Copy admin email and password"
              >
                � Copy All Admin Info
              </button>
            </div>
            <div className="credentials-section">
              <strong>👤 Customer Account:</strong>
              <div className="credential-item">Email: customer@gmail.com</div>
              <div className="credential-item">Password: PlantLover@456</div>
              <button
                type="button"
                className="copy-credential-btn"
                onClick={() =>
                  copyToClipboard("customer@gmail.com", "Customer email")
                }
                title="Copy customer email"
              >
                Copy Email
              </button>
              <button
                type="button"
                className="copy-credential-btn copy-all-btn"
                onClick={() =>
                  copyToClipboard(
                    "Email: customer@gmail.com\nPassword: PlantLover@456",
                    "Customer credentials"
                  )
                }
                title="Copy customer email and password"
              >
                � Copy All Customer Info
              </button>
            </div>
            <p className="test-note">
              Note: You can also create your own account via registration
            </p>
          </div>

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
